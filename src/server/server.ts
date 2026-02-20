import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

// Function to calculate recommended water intake (example formula)
const calculateRecommendedIntake = (weightKg: number, activityLevel: number, climate: string): number => {
  let baseIntake = weightKg * 30 // Base intake in ml

  // Adjust for activity level (example)
  baseIntake += activityLevel * 200

  // Adjust for climate (example)
  if (climate === 'hot') {
    baseIntake += 500
  } else if (climate === 'dry') {
    baseIntake += 300
  }

  return Math.round(baseIntake)
}

// API endpoint to get recommended water intake
app.get('/api/water-intake/recommendation', [
  body('weightKg').isNumeric().withMessage('Weight must be a number in kilograms'),
  body('activityLevel').isNumeric().withMessage('Activity level must be a number'),
  body('climate').isString().withMessage('Climate must be a string'),
], async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { weightKg, activityLevel, climate } = req.body

  try {
    const recommendedIntake = calculateRecommendedIntake(weightKg, activityLevel, climate)
    res.json({ recommendedIntake })
  } catch (error) {
    console.error('Error calculating recommended intake:', error)
    res.status(500).json({ error: 'Failed to calculate recommended intake' })
  }
})

// API endpoint to set daily water intake goal
app.post('/api/goals', [
  body('userId').isInt().withMessage('User ID must be an integer'),
  body('dailyGoalMl').isInt({ min: 0 }).withMessage('Daily goal must be a non-negative integer'),
], async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { userId, dailyGoalMl } = req.body

  try {
    const result = await pool.query(
      'INSERT INTO goals (user_id, daily_goal_ml, start_date) VALUES ($1, $2, NOW()) RETURNING *',
      [userId, dailyGoalMl]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error setting daily goal:', error)
    res.status(500).json({ error: 'Failed to set daily goal' })
  }
})

// API endpoint to get current daily water intake goal for a user
app.get('/api/goals/:userId', async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId)

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' })
  }

  try {
    const result = await pool.query(
      'SELECT * FROM goals WHERE user_id = $1 AND end_date IS NULL',
      [userId]
    )

    if (result.rows.length > 0) {
      res.json(result.rows[0])
    } else {
      res.status(404).json({ message: 'No active goal found for this user' })
    }
  } catch (error) {
    console.error('Error getting daily goal:', error)
    res.status(500).json({ error: 'Failed to get daily goal' })
  }
})

// API endpoint to update daily water intake goal
app.put('/api/goals/:id', [
  body('dailyGoalMl').isInt({ min: 0 }).withMessage('Daily goal must be a non-negative integer'),
], async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const goalId = parseInt(req.params.id)
  const { dailyGoalMl } = req.body

  if (isNaN(goalId)) {
    return res.status(400).json({ error: 'Invalid goal ID' })
  }

  try {
    // First, end the current goal
    await pool.query('UPDATE goals SET end_date = NOW() WHERE id = $1', [goalId])

    // Then, create a new goal with the updated value
    const result = await pool.query(
      'INSERT INTO goals (user_id, daily_goal_ml, start_date) SELECT user_id, $2, NOW() FROM goals WHERE id = $1 RETURNING *',
      [goalId, dailyGoalMl]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating daily goal:', error)
    res.status(500).json({ error: 'Failed to update daily goal' })
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
