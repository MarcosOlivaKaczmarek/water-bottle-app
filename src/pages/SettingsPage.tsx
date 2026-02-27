import React from 'react'

const SettingsPage: React.FC = () => {
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Clear the authentication token from local storage or cookies
        localStorage.removeItem('token')
        // Redirect the user to the login page
        window.location.href = '/login'
      } else {
        console.error('Logout failed')
      }
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  return (
    <div className="rounded-md bg-white p-6 shadow-md">
      <h2 className="text-lg font-semibold mb-4">Settings</h2>
      <button
        className="rounded-md bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  )
}

export default SettingsPage