import { Request, Response } from 'express'
import { logIntake, getIntake, getHistoricalIntake } from '../services/waterIntakeService'

export const logWaterIntake = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id
    const { quantity_ml } = req.body

    const newLog = await logIntake(userId, quantity_ml)

    res.status(201).json({ message: 'Water intake logged successfully', log: newLog })
  } catch (error) {
    console.error('Error logging water intake:', error)
    res.status(500).json({ message: 'Failed to log water intake' })
  }
}

export const getWaterIntake = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id
    const intake = await getIntake(userId)

    res.status(200).json({ intake })
  } catch (error) {
    console.error('Error getting water intake:', error)
    res.status(500).json({ message: 'Failed to get water intake' })
  }
}

export const getHistoricalWaterIntake = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id
    const { range } = req.query

    const historicalData = await getHistoricalIntake(userId, range as string)

    res.status(200).json(historicalData)
  } catch (error) {
    console.error('Error getting historical water intake:', error)
    res.status(500).json({ message: 'Failed to get historical water intake' })
  }
}
