import express, { Request, Response } from 'express'
import { query } from '../db'
import { authMiddleware } from '../middleware/auth'
import { scheduleReminder } from '../utils/scheduler'
import { validateTime } from '../utils/timeValidator'

const router = express.Router()

// Extend the express Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user: { id: number }
    }
  }
}

// Define the Reminder interface
interface Reminder {
  id: number
  user_id: number
  time: string // Format: HH:mm
  frequency: 'daily' | 'weekly' | 'monthly' | 'once'
  days?: string[] // e.g., ['Mon', 'Wed', 'Fri'] for weekly reminders
  message: string
}

// GET all reminders for a user
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const result = await query('SELECT * FROM reminders WHERE user_id = $1', [userId])
    res.json(result.rows)
  } catch (error: any) {
    console.error('Error fetching reminders:', error)
    res.status(500).json({ message: 'Failed to fetch reminders', error: error.message })
  }
})

// GET a specific reminder by ID
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const reminderId = parseInt(req.params.id)

    const result = await query('SELECT * FROM reminders WHERE id = $1 AND user_id = $2', [reminderId, userId])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reminder not found' })
    }

    res.json(result.rows[0])
  } catch (error: any) {
    console.error('Error fetching reminder:', error)
    res.status(500).json({ message: 'Failed to fetch reminder', error: error.message })
  }
})

// POST a new reminder
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { time, frequency, days, message } = req.body

    if (!validateTime(time)) {
      return res.status(400).json({ message: 'Invalid time format. Please use HH:mm (e.g., 08:00, 14:30).' })
    }

    if (!['daily', 'weekly', 'monthly', 'once'].includes(frequency)) {
      return res.status(400).json({ message: 'Invalid frequency. Must be daily, weekly, monthly, or once.' })
    }

    if (frequency === 'weekly' && (!days || !Array.isArray(days) || days.length === 0)) {
      return res.status(400).json({ message: 'Weekly reminders must have a days array.' })
    }

    const result = await query(
      'INSERT INTO reminders (user_id, time, frequency, days, message) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, time, frequency, days, message],
    )

    const newReminder: Reminder = result.rows[0]

    scheduleReminder(newReminder)

    res.status(201).json(newReminder)
  } catch (error: any) {
    console.error('Error creating reminder:', error)
    res.status(500).json({ message: 'Failed to create reminder', error: error.message })
  }
})

// PUT (update) an existing reminder
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const reminderId = parseInt(req.params.id)
    const { time, frequency, days, message } = req.body

    if (!validateTime(time)) {
      return res.status(400).json({ message: 'Invalid time format. Please use HH:mm (e.g., 08:00, 14:30).' })
    }

    if (!['daily', 'weekly', 'monthly', 'once'].includes(frequency)) {
      return res.status(400).json({ message: 'Invalid frequency. Must be daily, weekly, monthly, or once.' })
    }

    if (frequency === 'weekly' && (!days || !Array.isArray(days) || days.length === 0)) {
      return res.status(400).json({ message: 'Weekly reminders must have a days array.' })
    }

    const result = await query(
      'UPDATE reminders SET time = $1, frequency = $2, days = $3, message = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [time, frequency, days, message, reminderId, userId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reminder not found' })
    }

    const updatedReminder: Reminder = result.rows[0]

    scheduleReminder(updatedReminder)

    res.json(updatedReminder)
  } catch (error: any) {
    console.error('Error updating reminder:', error)
    res.status(500).json({ message: 'Failed to update reminder', error: error.message })
  }
})

// DELETE a reminder
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const reminderToDeleteId = parseInt(req.params.id)

    const result = await query('DELETE FROM reminders WHERE id = $1 AND user_id = $2 RETURNING *', [reminderToDeleteId, userId])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reminder not found' })
    }

    res.json({ message: 'Reminder deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting reminder:', error)
    res.status(500).json({ message: 'Failed to delete reminder', error: error.message })
  }
})

export default router
