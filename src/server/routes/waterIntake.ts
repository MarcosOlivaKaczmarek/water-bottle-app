import express, { Request, Response } from 'express'
import { query } from '../db'

const router = express.Router()

// Extend the express Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user: { id: number }
    }
  }
}

// GET water intake for a specific user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const result = await query('SELECT * FROM water_intake_logs WHERE user_id = $1', [userId])
    res.json(result.rows)
  } catch (error: any) {
    console.error('Error fetching water intake:', error)
    res.status(500).json({ message: 'Failed to fetch water intake', error: error.message })
  }
})

// POST water intake for a specific user
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { quantity_ml, timestamp } = req.body
    const result = await query(
      'INSERT INTO water_intake_logs (user_id, quantity_ml, timestamp) VALUES ($1, $2, $3) RETURNING *',
      [userId, quantity_ml, timestamp],
    )
    res.status(201).json(result.rows[0])
  } catch (error: any) {
    console.error('Error creating water intake:', error)
    res.status(500).json({ message: 'Failed to create water intake', error: error.message })
  }
})

// GET historical water intake data
router.get('/historical', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const range = req.query.range as string // daily, weekly, monthly

    let queryText = ''
    switch (range) {
      case 'daily':
        queryText = `
          SELECT timestamp::date, SUM(quantity_ml) AS quantity_ml
          FROM water_intake_logs
          WHERE user_id = $1
          GROUP BY timestamp::date
          ORDER BY timestamp::date DESC
          LIMIT 7;
        `
        break
      case 'weekly':
        queryText = `
          SELECT date_trunc('week', timestamp)::date, SUM(quantity_ml) AS quantity_ml
          FROM water_intake_logs
          WHERE user_id = $1
          GROUP BY date_trunc('week', timestamp)::date
          ORDER BY date_trunc('week', timestamp)::date DESC
          LIMIT 4;
        `
        break
      case 'monthly':
        queryText = `
          SELECT date_trunc('month', timestamp)::date, SUM(quantity_ml) AS quantity_ml
          FROM water_intake_logs
          WHERE user_id = $1
          GROUP BY date_trunc('month', timestamp)::date
          ORDER BY date_trunc('month', timestamp)::date DESC
          LIMIT 12;
        `
        break
      default:
        return res.status(400).json({ message: 'Invalid time range' })
    }

    const result = await query(queryText, [userId])
    res.json(result.rows)
  } catch (error: any) {
    console.error('Error fetching historical data:', error)
    res.status(500).json({ message: 'Failed to fetch historical data', error: error.message })
  }
})

export default router
