import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface Settings {
  username: string
  email: string
  profilePicture: string | null
  dailyGoal: number
  notificationEnabled: boolean
}

const defaultSettings: Settings = {
  username: '',
  email: '',
  profilePicture: null,
  dailyGoal: 2000,
  notificationEnabled: true,
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [username, setUsername] = useLocalStorage<string>('username', '')
  const [email, setEmail] = useLocalStorage<string>('email', '')
  const [profilePicture, setProfilePicture] = useLocalStorage<string | null>('profilePicture', null)
  const [dailyGoal, setDailyGoal] = useLocalStorage<number>('dailyGoal', 2000)
  const [notificationEnabled, setNotificationEnabled] = useLocalStorage<boolean>('notificationEnabled', true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    setSettings({
      username: username,
      email: email,
      profilePicture: profilePicture,
      dailyGoal: dailyGoal,
      notificationEnabled: notificationEnabled,
    })
  }, [username, email, profilePicture, dailyGoal, notificationEnabled])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target

    const newValue = type === 'checkbox' ? checked : value

    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: newValue,
    }))
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSettings((prevSettings) => ({
          ...prevSettings,
          profilePicture: reader.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update local storage
      setUsername(settings.username)
      setEmail(settings.email)
      setProfilePicture(settings.profilePicture)
      setDailyGoal(settings.dailyGoal)
      setNotificationEnabled(settings.notificationEnabled)

      // Display success message
      alert('Settings saved successfully!')
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Failed to save settings.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900">Settings</h1>
        </div>
        <div className="rounded-md bg-white p-6 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  value={settings.username}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  value={settings.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">
                Profile Picture
              </label>
              <div className="mt-1">
                <input
                  id="profilePicture"
                  name="profilePicture"
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={handleProfilePictureChange}
                />
                {settings.profilePicture && (
                  <img
                    src={settings.profilePicture}
                    alt="Profile Preview"
                    className="mt-2 h-20 w-20 object-cover rounded"
                  />
                )}
              </div>
            </div>
            <div>
              <label htmlFor="dailyGoal" className="block text-sm font-medium text-gray-700">
                Daily Goal (ml)
              </label>
              <div className="mt-1">
                <input
                  id="dailyGoal"
                  name="dailyGoal"
                  type="number"
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  value={settings.dailyGoal}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="notificationEnabled" className="flex items-center">
                <input
                  id="notificationEnabled"
                  name="notificationEnabled"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={settings.notificationEnabled}
                  onChange={handleInputChange}
                />
                <span className="ml-2 block text-sm font-medium text-gray-700">Enable Notifications</span>
              </label>
            </div>
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
