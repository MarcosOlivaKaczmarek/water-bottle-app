import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'

const app = express()
const port = process.env.PORT || 3000

// Middleware to parse JSON bodies
app.use(express.json())

// Environment variables (make sure these are set in your environment)
const dbUrl = process.env.DATABASE_URL
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key' // Use a strong secret in production

if (!dbUrl) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

// Database connection pool
const pool = new Pool({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false, // Only for development; use a proper CA for production
  },
})

// Test the database connection
pool.query('SELECT NOW()', (err: Error) => {
  if (err) {
    console.error('Failed to connect to the database:', err)
    process.exit(1)
  }
  console.log('Connected to the database')
})

// User registration endpoint
app.post(
  '/register',
  [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { username, email, password } = req.body

    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Insert the user into the database
      const result = await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
        [username, email, hashedPassword],
      )

      // Generate a JWT token
      const token = jwt.sign({ userId: result.rows[0].id }, jwtSecret, { expiresIn: '1h' })

      res.status(201).json({ message: 'User registered successfully', user: result.rows[0], token })
    } catch (error) {
      console.error('Registration failed:', error)
      res.status(500).json({ message: 'Registration failed', error: (error as Error).message })
    }
  },
)

// User login endpoint
app.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    try {
      // Find the user by email
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' })
      }

      const user = result.rows[0]

      // Compare the password with the hashed password
      const passwordMatch = await bcrypt.compare(password, user.password)
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' })
      }

      // Generate a JWT token
      const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1h' })

      res.status(200).json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email }, token })
    } catch (error) {
      console.error('Login failed:', error)
      res.status(500).json({ message: 'Login failed', error: (error as Error).message })
    }
  },
)

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
