import express, { Request, Response } from 'express'
import { query } from '../../db'
import { validateReminder, scheduleReminder, unscheduleReminder } from '../utils/reminderUtils'
import { checkJwt } from '../../middleware/authMiddleware'
import { ReminderFrequency } from '../../types/reminder'
import { Request as ExpressRequest } from 'express'
import { scheduleAllReminders } from '../../scheduler'
import { logger } from '../../logger'
import { body, validationResult } from 'express-validator'

interface User {
  id: number
}

// Extend the Express Request interface to include the user property
interface CustomRequest extends ExpressRequest {
  user?: User // Use the User interface here
}

const router = express.Router()

// Middleware to validate reminder data
const validate = [
  body('time').notEmpty().withMessage('Time is required'),
  body('message').notEmpty().withMessage('Message is required').isLength({ max: 255 }).withMessage('Message must be less than 255 characters'),
  body('frequency').isIn(['once', 'daily', 'weekly']).withMessage('Invalid frequency'),
  body('dayOfWeek').optional().isInt({ min: 0, max: 6 }).withMessage('Invalid dayOfWeek. Must be between 0 and 6 (Sunday to Saturday)'),
  (req: Request, res: Response, next: any) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    next()
  },
]

// GET all reminders for a user
router.get('/', checkJwt, async (req: CustomRequest, res: Response) => {
  try {
    const userId = (req as any).user.id // Access user ID from request
    const result = await query('SELECT * FROM reminders WHERE user_id = $1', [userId])
    res.json(result.rows)
  } catch (err) {
    logger.error(`Error fetching reminders: ${err}`)
    res.status(500).json({ error: 'Failed to fetch reminders' })
  }
})

// GET a specific reminder by ID
router.get('/:id', checkJwt, async (req: CustomRequest, res: Response) => {
  try {
    const userId = (req as any).user.id // Access user ID from request
    const reminderId = parseInt(req.params.id, 10)

    if (isNaN(reminderId)) {
      return res.status(400).json({ error: 'Invalid reminder ID' })
    }

    const result = await query('SELECT * FROM reminders WHERE id = $1 AND user_id = $2', [reminderId, userId])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reminder not found' })
    }

    res.json(result.rows[0])
  } catch (err) {
    logger.error(`Error fetching reminder: ${err}`)
    res.status(500).json({ error: 'Failed to fetch reminder' })
  }
})

// POST a new reminder
router.post('/', checkJwt, validate, async (req: CustomRequest, res: Response) => {
  try {
    const userId = (req as any).user.id // Access user ID from request
    const { time, message, frequency, dayOfWeek } = req.body

    if (!validateReminder(time, frequency, dayOfWeek)) {
      return res.status(400).json({ error: 'Invalid reminder data' })
    }

    const result = await query(
      'INSERT INTO reminders (user_id, time, message, frequency, day_of_week) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, time, message, frequency, dayOfWeek],
    )

    const newReminder = result.rows[0]

    scheduleReminder(newReminder)

    logger.info(`Reminder created with id: ${newReminder.id}`)
    res.status(201).json(newReminder)
  } catch (err) {
    logger.error(`Error creating reminder: ${err}`)
    res.status(500).json({ error: 'Failed to create reminder' })
  }
})

// PUT (update) an existing reminder
router.put('/:id', checkJwt, validate, async (req: CustomRequest, res: Response) => {
  try {
    const userId = (req as any).user.id // Access user ID from request
    const reminderId = parseInt(req.params.id, 10)

    if (isNaN(reminderId)) {
      return res.status(400).json({ error: 'Invalid reminder ID' })
    }

    const { time, message, frequency, dayOfWeek } = req.body

    if (!validateReminder(time, frequency, dayOfWeek)) {
      return res.status(400).json({ error: 'Invalid reminder data' })
    }

    const result = await query(
      'UPDATE reminders SET time = $1, message = $2, frequency = $3, day_of_week = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [time, message, frequency, dayOfWeek, reminderId, userId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reminder not found' })
    }

    const updatedReminder = result.rows[0]

    unscheduleReminder(reminderId)
    scheduleReminder(updatedReminder)

    logger.info(`Reminder updated with id: ${updatedReminder.id}`)
    res.json(updatedReminder)
  } catch (err) {
    logger.error(`Error updating reminder: ${err}`)
    res.status(500).json({ error: 'Failed to update reminder' })
  }
})

// DELETE a reminder
router.delete('/:id', checkJwt, async (req: CustomRequest, res: Response) => {
  try {
    const userId = (req as any).user.id // Access user ID from request
    const reminderId = parseInt(req.params.id, 10)

    if (isNaN(reminderId)) {
      return res.status(400).json({ error: 'Invalid reminder ID' })
    }

    const result = await query('DELETE FROM reminders WHERE id = $1 AND user_id = $2 RETURNING *', [reminderId, userId])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reminder not found' })
    }

    unscheduleReminder(reminderId)

    logger.info(`Reminder deleted with id: ${reminderId}`)
    res.status(204).send()
  } catch (err) {
    logger.error(`Error deleting reminder: ${err}`)
    res.status(500).json({ error: 'Failed to delete reminder' })
  }
})

export default router
