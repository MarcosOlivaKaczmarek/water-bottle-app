import { Request, Response } from 'express'
import { setDailyGoal, getDailyGoal } from '../services/goalService'

export const setGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id
    const { daily_goal_ml } = req.body

    const newGoal = await setDailyGoal(userId, daily_goal_ml)

    res.status(201).json({ message: 'Goal set successfully', goal: newGoal })
  } catch (error) {
    console.error('Error setting goal:', error)
    res.status(500).json({ message: 'Failed to set goal' })
  }
}

export const getGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id
    const goal = await getDailyGoal(userId)

    res.status(200).json({ goal })
  } catch (error) {
    console.error('Error getting goal:', error)
    res.status(500).json({ message: 'Failed to get goal' })
  }
}
