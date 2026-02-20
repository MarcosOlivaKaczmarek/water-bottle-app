import React, { useState } from 'react'

const SettingsPage = () => {
  const [profile, setProfile] = useState({
    username: 'JohnDoe',
    email: 'john.doe@example.com',
    notificationsEnabled: true,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement API call to update settings
    console.log('Settings updated:', profile)
    alert('Settings saved!')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900">
            Settings
          </h1>
        </div>
        <div className="rounded-md bg-white p-6 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  value={profile.username}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  value={profile.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                id="notificationsEnabled"
                name="notificationsEnabled"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={profile.notificationsEnabled}
                onChange={handleInputChange}
              />
              <label
                htmlFor="notificationsEnabled"
                className="ml-2 block text-sm text-gray-900"
              >
                Enable Notifications
              </label>
            </div>
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
