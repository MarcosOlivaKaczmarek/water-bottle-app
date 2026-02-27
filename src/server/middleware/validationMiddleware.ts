import { Request, Response, NextFunction } from 'express'
import { query } from '../db'

export const validateRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  if (username.length < 3) {
    return res
      .status(400)
      .json({ message: 'Username must be at least 3 characters long' })
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: 'Password must be at least 6 characters long' })
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' })
  }

  // Check if username or email already exists
  try {
    const usernameCheck = await query(
      'SELECT * FROM users WHERE username = $1', // Corrected query
      [username],
    )
    if (usernameCheck.rows.length > 0) {
      return res.status(409).json({ message: 'Username already exists' })
    }

    const emailCheck = await query('SELECT * FROM users WHERE email = $1', [email])
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ message: 'Email already exists' })
    }
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ message: 'Database error', error: (error as Error).message })
  }

  next()
}
