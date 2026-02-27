import express, { Request, Response } from 'express'
import { calculateRecommendedIntake } from '../utils/recommendationUtils'
import { authenticateToken } from '../middleware/authMiddleware'

const router = express.Router()

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Assuming user information is available in req.user after authentication
    const userId = (req.user as { id: number }).id

    // Fetch user data from the database based on userId
    // Replace this with your actual database query
    const user = await req.db.query('SELECT * FROM users WHERE id = $1', [userId])

    if (!user || user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const userData = user.rows[0]

    // Extract relevant user data for recommendation calculation
    const weightKg = userData.weight || parseFloat(process.env.DEFAULT_WEIGHT_KG || '70')
    const activityLevel = userData.activity_level || parseInt(process.env.DEFAULT_ACTIVITY_LEVEL || '1')
    const climate = userData.climate || process.env.DEFAULT_CLIMATE || 'moderate'

    // Calculate recommended water intake
    const recommendedIntake = calculateRecommendedIntake(
      weightKg,
      activityLevel,
      climate,
    )

    // Return the recommendation
    res.status(200).json({ recommendedIntake })
  } catch (error) {
    console.error('Error fetching recommendation:', error)
    res.status(500).json({ message: 'Failed to retrieve recommendation' })
  }
})

export default router
