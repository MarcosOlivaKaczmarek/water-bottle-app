import express, { Request, Response } from 'express'
import { query } from '../db'

const router = express.Router()

// GET all reminders for a user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id // Assuming user ID is available in the request
    const result = await query('SELECT * FROM reminders WHERE user_id = $1', [userId])
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error fetching reminders' })
  }
})

// POST a new reminder
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id // Assuming user ID is available in the request
    const { time, frequency } = req.body

    if (!time || !frequency) {
      return res.status(400).json({ message: 'Time and frequency are required' })
    }

    // Validate time format (HH:mm)
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
      return res.status(400).json({ message: 'Invalid time format. Use HH:mm' })
    }

    const result = await query(
      'INSERT INTO reminders (user_id, time, frequency) VALUES ($1, $2, $3) RETURNING *',
      [userId, time, frequency],
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error creating reminder' })
  }
})

// DELETE a reminder
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id // Assuming user ID is available in the request
    const reminderId = parseInt(req.params.id)

    const result = await query('DELETE FROM reminders WHERE id = $1 AND user_id = $2 RETURNING *', [reminderId, userId])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reminder not found' })
    }

    res.json({ message: 'Reminder deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error deleting reminder' })
  }
})

export default router
