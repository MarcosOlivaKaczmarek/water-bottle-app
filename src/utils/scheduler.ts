import cron from 'node-cron'
import { query } from '../server/db'

// Extend the express Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user: { id: number }
    }
  }
}

interface Reminder {
  id: number
  user_id: number
  time: string // Format: HH:mm
  frequency: 'daily' | 'weekly' | 'monthly' | 'once'
  days?: string[] // e.g., ['Mon', 'Wed', 'Fri'] for weekly reminders
  message: string
}

const scheduledTasks: { [key: number]: cron.ScheduledTask } = {}

export const scheduleReminder = (reminder: Reminder) => {
  // Cancel existing task if it exists
  if (scheduledTasks[reminder.id]) {
    scheduledTasks[reminder.id].destroy()
  }

  let cronExpression = ''

  switch (reminder.frequency) {
    case 'daily':
      // Run every day at the specified time
      const [hours, minutes] = reminder.time.split(':').map(Number)
      cronExpression = `${minutes} ${hours} * * *`
      break
    case 'weekly':
      // Run on specific days of the week at the specified time
      if (!reminder.days || reminder.days.length === 0) {
        console.error('No days specified for weekly reminder:', reminder.id)
        return
      }
      const cronDays = reminder.days.map(day => {
        switch (day) {
          case 'Mon': return 1
          case 'Tue': return 2
          case 'Wed': return 3
          case 'Thu': return 4
          case 'Fri': return 5
          case 'Sat': return 6
          case 'Sun': return 0
          default: return -1 // Invalid day
        }
      }).filter(day => day !== -1).join(',')

      const [hoursWeekly, minutesWeekly] = reminder.time.split(':').map(Number)
      cronExpression = `${minutesWeekly} ${hoursWeekly} * * ${cronDays}`
      break
    case 'monthly':
      // Run on the first day of every month at the specified time
      const [hoursMonthly, minutesMonthly] = reminder.time.split(':').map(Number)
      cronExpression = `${minutesMonthly} ${hoursMonthly} 1 * *`
      break
    case 'once':
          // Schedule to run once at a specific date and time
          const reminderDateTime = new Date();
          const [hoursOnce, minutesOnce] = reminder.time.split(':').map(Number);

          reminderDateTime.setHours(hoursOnce);
          reminderDateTime.setMinutes(minutesOnce);
          reminderDateTime.setSeconds(0);

          // Calculate the delay in milliseconds until the reminder time
          const delay = reminderDateTime.getTime() - Date.now();

          if (delay > 0) {
            setTimeout(() => {
              console.log(`Reminder '${reminder.message}' for user ${reminder.user_id}`)
              // Remove the reminder from the database after it's been triggered
              query('DELETE FROM reminders WHERE id = $1', [reminder.id]).catch(err => {
                console.error('Failed to delete one-time reminder after execution:', err)
              })
            }, delay);
          } else {
            console.log('One-time reminder is in the past, skipping.')
          }
          return;
    default:
      console.error('Invalid frequency:', reminder.frequency)
      return
  }

  if (cronExpression) {
    scheduledTasks[reminder.id] = cron.schedule(cronExpression, () => {
      console.log(`Reminder '${reminder.message}' for user ${reminder.user_id}`)
    })

    scheduledTasks[reminder.id].start()
    console.log(`Scheduled reminder ${reminder.id} with expression: ${cronExpression}`)
  }
}

export const scheduleAllReminders = async () => {
  try {
    const result = await query('SELECT * FROM reminders', [])
    const reminders: Reminder[] = result.rows

    reminders.forEach(reminder => {
      scheduleReminder(reminder)
    })

    console.log(`Scheduled ${reminders.length} reminders on server start.`)
  } catch (error) {
    console.error('Failed to schedule all reminders on server start:', error)
  }
}
