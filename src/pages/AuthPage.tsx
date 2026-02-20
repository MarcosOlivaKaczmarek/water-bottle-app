import React, { useState } from 'react'
import LoginForm from '../components/auth/LoginForm'
import RegistrationForm from '../components/auth/RegistrationForm'
import LogoutButton from '../components/auth/LogoutButton'

const AuthPage = () => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<{
    id: string
    username: string
    email: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      setToken(data.token)
      setUser(data.user)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      setToken(data.token)
      setUser(data.user)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-center">Authentication</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {token ? (
          <div>
            <p className="mb-4 text-center">Welcome, {user?.username}!</p>
            <LogoutButton onLogout={handleLogout} />
          </div>
        ) : (
          <>
            <h3 className="text-xl font-semibold mb-2">Register</h3>
            <RegistrationForm onRegister={handleRegister} />
            <h3 className="text-xl font-semibold mt-4 mb-2">Login</h3>
            <LoginForm onLogin={handleLogin} />
          </>
        )}
      </div>
    </div>
  )
}

export default AuthPage
