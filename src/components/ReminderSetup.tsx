import React, { useState, useEffect } from 'react'

interface Reminder {
  id: number
  time: string // Format: HH:mm
}

const ReminderSetup: React.FC = () => {
  const [frequency, setFrequency] = useState<'daily' | 'specific'>('daily')
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [newTime, setNewTime] = useState('')
  const [nextReminderTime, setNextReminderTime] = useState<Date | null>(null)

  useEffect(() => {
    calculateNextReminder()
  }, [reminders])

  const calculateNextReminder = () => {
    if (reminders.length === 0) {
      setNextReminderTime(null)
      return
    }

    const now = new Date()
    let nextTime: Date | null = null

    for (const reminder of reminders) {
      const [hours, minutes] = reminder.time.split(':').map(Number)
      const reminderDate = new Date()
      reminderDate.setHours(hours)
      reminderDate.setMinutes(minutes)
      reminderDate.setSeconds(0)
      reminderDate.setMilliseconds(0)

      if (reminderDate <= now) {
        reminderDate.setDate(now.getDate() + 1)
      }

      if (!nextTime || reminderDate < nextTime) {
        nextTime = reminderDate
      }
    }

    setNextReminderTime(nextTime)
  }

  const addReminder = () => {
    if (!newTime.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      alert('Invalid time format. Please use HH:mm (e.g., 08:00, 14:30).')
      return
    }

    const newReminder: Reminder = {
      id: Date.now(), // Simple unique ID
      time: newTime,
    }
    setReminders([...reminders, newReminder])
    setNewTime('')
  }

  const removeReminder = (id: number) => {
    setReminders(reminders.filter((reminder) => reminder.id !== id))
  }

  const formatNextReminderTime = (date: Date | null): string => {
    if (!date) return 'No reminders set.'

    const now = new Date()
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()

    const timeFormat = { hour: 'numeric', minute: 'numeric', hour12: true }
    const dateFormat = { weekday: 'long', month: 'long', day: 'numeric' }

    if (isToday) {
      return `Today at ${date.toLocaleTimeString(undefined, timeFormat)}`
    } else {
      return `On ${date.toLocaleDateString(undefined, dateFormat)} at ${date.toLocaleTimeString(undefined, timeFormat)}`
    }
  }

  return (
    <div className="rounded-md bg-white p-6 shadow-md">
      <h2 className="text-lg font-semibold mb-4">Hydration Reminders</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Frequency:</label>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={frequency}
          onChange={(e) =>
            setFrequency(e.target.value as 'daily' | 'specific')
          }
        >
          <option value="daily">Daily</option>
          <option value="specific">Specific Times</option>
        </select>
      </div>

      {frequency === 'specific' && (
        <div>
          <div className="mb-4">
            <label
              htmlFor="newTime"
              className="block text-sm font-medium text-gray-700"
            >
              Add Time (HH:mm):
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="newTime"
                className="flex-1 block w-full rounded-md rounded-r-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="HH:mm (e.g., 08:00)"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
              <button
                type="button"
                className="inline-flex items-center rounded-r-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={addReminder}
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <ul className="list-disc list-inside mb-4">
              {reminders.map((reminder) => (
                <li key={reminder.id} className="mb-2">
                  {reminder.time}
                  <button
                    className="ml-2 text-red-500 hover:text-red-700"
                    onClick={() => removeReminder(reminder.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div>
        <p>
          Next Reminder:{' '}
          {formatNextReminderTime(nextReminderTime)}
        </p>
      </div>
    </div>
  )
}

export default ReminderSetup
