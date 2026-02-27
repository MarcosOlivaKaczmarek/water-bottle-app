import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { query } from '../db'
import { validateRegistration } from '../middleware/validationMiddleware'

const router = express.Router()

// User Registration
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert the user into the database
    const result = await query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email', // Corrected query
      [username, email, hashedPassword],
    )

    const user = result.rows[0]

    // Generate a JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key', { // Use environment variable
      expiresIn: '1h',
    })

    res.status(201).json({ user: { id: user.id, username: user.username, email: user.email }, token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Registration failed', error: (error as Error).message })
  }
})

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if the user exists
    const result = await query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key', { // Use environment variable
      expiresIn: '1h',
    })

    res.status(200).json({ user: { id: user.id, username: user.username, email: user.email }, token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Login failed', error: (error as Error).message })
  }
})

export default router
