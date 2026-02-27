import { Request, Response } from 'express'
import { createReminder, getReminders, deleteReminder } from '../services/hydrationReminderService'

export const createHydrationReminder = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id
    const { cron_expression, quantity_ml } = req.body

    const newReminder = await createReminder(userId, cron_expression, quantity_ml)

    res.status(201).json({ message: 'Hydration reminder created successfully', reminder: newReminder })
  } catch (error) {
    console.error('Error creating hydration reminder:', error)
    res.status(500).json({ message: 'Failed to create hydration reminder' })
  }
}

export const getHydrationReminders = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id
    const reminders = await getReminders(userId)

    res.status(200).json(reminders)
  } catch (error) {
    console.error('Error getting hydration reminders:', error)
    res.status(500).json({ message: 'Failed to get hydration reminders' })
  }
}

export const deleteHydrationReminder = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id
    const { id } = req.params

    await deleteReminder(userId, parseInt(id))

    res.status(200).json({ message: 'Hydration reminder deleted successfully' })
  } catch (error) {
    console.error('Error deleting hydration reminder:', error)
    res.status(500).json({ message: 'Failed to delete hydration reminder' })
  }
}
