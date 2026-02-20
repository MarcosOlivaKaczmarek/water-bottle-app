import { ReminderFrequency } from '../../types/reminder'
import { scheduledReminders } from '../../scheduler'
import { query } from '../db'
import { logger } from '../../logger'
import { scheduleAllReminders } from '../../scheduler'
const cron = require('node-cron')

export function validateReminder(time: string, frequency: ReminderFrequency, dayOfWeek?: number): boolean {
  if (!time.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    return false
  }

  if (frequency === 'weekly' && (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6)) {
    return false
  }

  return true
}

export async function scheduleReminder(reminder: any) {
  try {
    if (scheduledReminders[reminder.id]) {
      scheduledReminders[reminder.id].destroy()
    }

    let cronExpression = ''

    switch (reminder.frequency) {
      case 'daily':
        cronExpression = `0 ${reminder.time.split(':')[1]} ${reminder.time.split(':')[0]} * * *`
        break
      case 'weekly':
        if (reminder.day_of_week === undefined) {
          throw new Error('Day of week is required for weekly reminders')
        }
        cronExpression = `0 ${reminder.time.split(':')[1]} ${reminder.time.split(':')[0]} * * ${reminder.day_of_week}`
        break
      case 'once':
        const [hours, minutes] = reminder.time.split(':').map(Number)
        const reminderTime = new Date()
        reminderTime.setHours(hours)
        reminderTime.setMinutes(minutes)
        reminderTime.setSeconds(0)

        // Schedule the reminder to be triggered only once
        const timeDiff = reminderTime.getTime() - Date.now()

        if (timeDiff <= 0) {
          logger.warn(`The reminder with id ${reminder.id} will not be scheduled because it is set for the past.`)
          return // Don't schedule if the time is in the past
        }

        scheduledReminders[reminder.id] = setTimeout(async () => {
          logger.info(`Executing one-time reminder with id ${reminder.id}: ${reminder.message}`)
          // Simulate sending a notification
          console.log(`Reminder: ${reminder.message}`)

          // Optionally, remove the reminder from the database after execution
          await query('DELETE FROM reminders WHERE id = $1', [reminder.id])
          delete scheduledReminders[reminder.id]
        }, timeDiff)

        return
      default:
        throw new Error(`Invalid frequency: ${reminder.frequency}`)
    }

    if (reminder.frequency !== 'once') {
      scheduledReminders[reminder.id] = cron.schedule(cronExpression, () => {
        logger.info(`Executing reminder with id ${reminder.id}: ${reminder.message}`)
        // Simulate sending a notification
        console.log(`Reminder: ${reminder.message}`)
      })
    }


    logger.info(`Scheduled reminder with id ${reminder.id}, frequency: ${reminder.frequency}, cron: ${cronExpression}`)
  } catch (error: any) {
    logger.error(`Error scheduling reminder ${reminder.id}: ${error.message}`)
  }
}

export function unscheduleReminder(reminderId: number) {
  if (scheduledReminders[reminderId]) {
    if (typeof scheduledReminders[reminderId].destroy === 'function') {
      scheduledReminders[reminderId].destroy()
    } else {
      clearTimeout(scheduledReminders[reminderId]) // For 'once' reminders
    }
    delete scheduledReminders[reminderId]
    logger.info(`Unscheduled reminder ${reminderId}`)
  }
}
