import express, { Request, Response, NextFunction } from 'express'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000
const jwtSigningKey = process.env.JWT_SIGNING_KEY
const bcryptSaltRounds = process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS) : 10

if (!jwtSigningKey) {
  console.error('JWT signing key is not defined. Exiting...')
  process.exit(1)
}

app.use(express.json())

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  database: process.env.DB_NAME || 'water_bottle',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

let pool: Pool

try {
  pool = new Pool(dbConfig)
} catch (error) {
  console.error('Error creating database connection pool:', error)
  process.exit(1)
}

// Extend the Request interface to include the user property
interface CustomRequest extends Request {
  user?: {
    id: number
    username: string
  }
}

// Middleware to verify JWT token
const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (authHeader) {
    const token = authHeader.split(' ')[1]

    jwt.verify(token, jwtSigningKey, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' })
      }

      req.user = { id: decoded.id, username: decoded.username }
      next()
    })
  } else {
    res.status(401).json({ message: 'Token not provided' })
  }
}

// User registration endpoint
app.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
    body('email').trim().isEmail().withMessage('Invalid email address'),
    body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { username, email, password } = req.body

    try {
      const hashedPassword = await bcrypt.hash(password, bcryptSaltRounds)

      const result = await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email', // Returning email as well
        [username, email, hashedPassword],
      )

      const user = result.rows[0]

      const token = jwt.sign({ id: user.id, username: user.username }, jwtSigningKey, { expiresIn: '1h' })

      res.status(201).json({ message: 'User registered successfully', user, token })
    } catch (error: any) {
      console.error('Error registering user:', error)
      if (error.code === '23505') {
        // Unique violation error code
        return res.status(400).json({ message: 'Username or email already exists' })
      }
      res.status(500).json({ message: 'Internal server error' })
    }
  },
)

// User login endpoint
app.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Invalid email address'),
    body('password').trim().notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])

      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' })
      }

      const user = result.rows[0]

      const passwordMatch = await bcrypt.compare(password, user.password)

      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' })
      }

      const token = jwt.sign({ id: user.id, username: user.username }, jwtSigningKey, { expiresIn: '1h' })

      // Include email in the response for consistency
      res.status(200).json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email }, token })
    } catch (error) {
      console.error('Error logging in:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
)

// Logout endpoint (client-side implementation, server-side invalidation not feasible with JWT)
app.post('/logout', verifyToken, (req: CustomRequest, res: Response) => {
  // On the client-side, the token should be removed from storage (e.g., localStorage, cookies)
  res.status(200).json({ message: 'Logout successful' })
})

// Water intake logging endpoint
app.post(
  '/water-intake',
  verifyToken,
  [
    body('quantity_ml')
      .isInt({ min: 1 }) // Ensure quantity is a positive integer
      .withMessage('Quantity must be a positive integer'),
  ],
  async (req: CustomRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { quantity_ml } = req.body
    const userId = req.user?.id // Access user ID from the verified token

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in token' })
    }

    try {
      const result = await pool.query(
        'INSERT INTO water_intake_logs (user_id, quantity_ml) VALUES ($1, $2) RETURNING id, user_id, quantity_ml, timestamp',
        [userId, quantity_ml],
      )

      const log = result.rows[0]
      res.status(201).json({ message: 'Water intake logged successfully', log })
    } catch (error: any) {
      console.error('Error logging water intake:', error)
      res.status(500).json({ message: 'Failed to log water intake' })
    }
  },
)

// Example protected route
app.get('/profile', verifyToken, (req: CustomRequest, res: Response) => {
  res.status(200).json({ message: 'Protected route accessed', user: req.user })
})

// Centralized error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  if (err instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({ message: 'Invalid JWT token' })
  }
  // More specific error handling can be added here based on the error type
  res.status(500).json({ message: 'Something went wrong!' })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
