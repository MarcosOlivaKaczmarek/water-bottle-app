import React, { useState } from 'react'

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const endpoint = isLogin ? '/api/login' : '/api/register'
    const userData = isLogin ? { email, password } : { username, email, password }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Successfully ${isLogin ? 'logged in' : 'registered'}!`)
        // Store the token in local storage or a cookie
        localStorage.setItem('token', data.token)
        // Redirect or update UI as needed
      } else {
        setMessage(data.message || 'An error occurred.')
      }
    } catch (error: any) {
      setMessage(error.message || 'An unexpected error occurred.')
    }
  }

  return (
    <div className="rounded-md bg-white p-6 shadow-md">
      <h2 className="text-lg font-semibold mb-4">{isLogin ? 'Login' : 'Register'}</h2>
      {message && <p className="mb-4 text-sm text-green-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username:
            </label>
            <input
              type="text"
              id="username"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email:
          </label>
          <input
            type="email"
            id="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password:
          </label>
          <input
            type="password"
            id="password"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <button
            type="submit"
            className="rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </div>
      </form>
      <button
        onClick={() => setIsLogin(!isLogin)}
        className="mt-4 text-sm text-blue-500 hover:text-blue-700 focus:outline-none"
      >
        {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
      </button>
    </div>
  )
}

export default AuthPage
