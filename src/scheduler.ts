import { query } from './server/db'
import { scheduleReminder, unscheduleReminder } from './server/utils/reminderUtils'
import { logger } from './logger'

export const scheduledReminders: { [key: number]: any } = {}

export const scheduleAllReminders = async () => {
  try {
    const result = await query('SELECT * FROM reminders', [])
    const reminders = result.rows

    logger.info(`Scheduling ${reminders.length} reminders on server start.`)

    for (const reminder of reminders) {
      scheduleReminder(reminder)
    }
  } catch (error) {
    logger.error('Failed to schedule all reminders', error)
  }
}
