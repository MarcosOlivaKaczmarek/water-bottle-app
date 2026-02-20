import express, { Request, Response } from 'express'
import { query, validationResult } from 'express-validator'
import { db } from '../db'
import { authenticateToken } from '../middleware/authMiddleware'
import { calculateRecommendedIntake } from '../utils/waterIntakeCalculation'
import { logRequest } from '../middleware/loggingMiddleware'

const router = express.Router()

// Enum for allowed climate values
enum Climate {
  COLD = 'cold',
  MODERATE = 'moderate',
  HOT = 'hot',
}

// Function to check if a string is a valid Climate enum value
function isValidClimate(climate: string): boolean {
  return Object.values(Climate).includes(climate as Climate)
}

// GET: Retrieve current daily goal for a user
router.get('/', authenticateToken, logRequest, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const result = await db.query('SELECT * FROM goals WHERE user_id = $1 AND end_date IS NULL', [userId])

    if (result.rows.length > 0) {
      res.json(result.rows[0])
    } else {
      res.status(404).json({ message: 'No current goal found for this user' })
    }
  } catch (error) {
    console.error('Error fetching goal:', error)
    res.status(500).json({ message: 'Error fetching goal' })
  }
})

// PUT: Update daily goal for a user
router.put(
  '/',
  authenticateToken,
  logRequest,
  [
    query('weight').isNumeric().withMessage('Weight must be a number'),
    query('activityLevel').isNumeric().withMessage('Activity level must be a number'),
    query('climate').isString().withMessage('Climate must be a string'),
    query('daily_goal_ml').optional().isNumeric().withMessage('Daily goal must be a number'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const userId = req.user!.id
      const { weight, activityLevel, climate } = req.query
      let { daily_goal_ml } = req.query

      // Validate climate against the Climate enum
      if (!isValidClimate(climate as string)) {
        return res.status(400).json({ message: 'Invalid climate value' })
      }

      // Calculate recommended intake if daily_goal_ml is not provided
      if (!daily_goal_ml) {
        daily_goal_ml = calculateRecommendedIntake(
          parseFloat(weight as string),
          parseFloat(activityLevel as string),
          climate as Climate,
        ).toString()
      }

      // End the current goal
      await db.query('UPDATE goals SET end_date = NOW() WHERE user_id = $1 AND end_date IS NULL', [userId])

      // Create a new goal
      const result = await db.query(
        'INSERT INTO goals (user_id, daily_goal_ml, start_date) VALUES ($1, $2, NOW()) RETURNING *',
        [userId, daily_goal_ml],
      )

      res.json(result.rows[0])
    } catch (error) {
      console.error('Error updating goal:', error)
      res.status(500).json({ message: 'Error updating goal' })
    }
  },
)

export default router
