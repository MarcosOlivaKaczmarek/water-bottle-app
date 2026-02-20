import express, { Request, Response, NextFunction } from 'express'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import winston from 'winston'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000
const jwtSecret = process.env.AUTH_JWT_SECRET

// Define a type for the user object in the request
interface User {
  id: number
  username: string
}

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'water-bottle-app' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})

if (!jwtSecret) {
  logger.error('JWT secret is not defined. Exiting...')
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
  logger.error('Error creating database connection pool:', error)
  process.exit(1)
}

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
})

// Apply rate limiting to all requests
app.use(limiter)

// Middleware to verify JWT token
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (authHeader) {
    const token = authHeader.split(' ')[1]

    jwt.verify(token, jwtSecret, (err: any, user: any) => {
      if (err) {
        logger.warn('Invalid token received', { error: err.message })
        return res.status(403).json({ message: 'Invalid token' })
      }

      req.user = user as User // Type assertion after verification
      next()
    })
  } else {
    logger.warn('Token not provided')
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
      logger.warn('Validation errors during registration', { errors: errors.array() })
      return res.status(400).json({ errors: errors.array() })
    }

    const { username, email, password } = req.body

    try {
      const hashedPassword = await bcrypt.hash(password, 10)

      const result = await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
        [username, email, hashedPassword],
      )

      const user = result.rows[0]

      const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, { expiresIn: '1h' })

      res.status(201).json({ message: 'User registered successfully', user, token })
      logger.info('User registered successfully', { userId: user.id, username })
    } catch (error: any) {
      logger.error('Error registering user:', error)
      if (error.code === '23505') {
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
      logger.warn('Validation errors during login', { errors: errors.array() })
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])

      if (result.rows.length === 0) {
        logger.warn('Invalid login attempt', { email })
        return res.status(401).json({ message: 'Invalid credentials' })
      }

      const user = result.rows[0]

      const passwordMatch = await bcrypt.compare(password, user.password)

      if (!passwordMatch) {
        logger.warn('Invalid login attempt', { email })
        return res.status(401).json({ message: 'Invalid credentials' })
      }

      const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, { expiresIn: '1h' })

      res.status(200).json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email }, token })
      logger.info('User logged in successfully', { userId: user.id, username: user.username })
    } catch (error) {
      logger.error('Error logging in:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
)

// Logout endpoint (client-side implementation, server-side invalidation not feasible with JWT)
app.post('/logout', verifyToken, (req: Request, res: Response) => {
  // On the client-side, the token should be removed from storage (e.g., localStorage, cookies)
  res.status(200).json({ message: 'Logout successful' })
  logger.info('User logged out', { userId: (req.user as User).id, username: (req.user as User).username })
})

// Example protected route
app.get('/profile', verifyToken, (req: Request, res: Response) => {
  res.status(200).json({ message: 'Protected route accessed', user: req.user })
})

// Water intake logging endpoint
app.post(
  '/water-intake',
  verifyToken,
  [
    body('quantity_ml')
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      logger.warn('Validation errors during water intake logging', { errors: errors.array() })
      return res.status(400).json({ errors: errors.array() })
    }

    const { quantity_ml } = req.body
    const userId = (req.user as User).id

    try {
      const result = await pool.query(
        'INSERT INTO water_intake_logs (user_id, quantity_ml) VALUES ($1, $2) RETURNING *',
        [userId, quantity_ml],
      )

      const log = result.rows[0]
      res.status(201).json({ message: 'Water intake logged successfully', log })
      logger.info('Water intake logged', { userId, quantity_ml })
    } catch (error) {
      logger.error('Error logging water intake:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
)

// Get water intake logs for a user
app.get('/water-intake', verifyToken, async (req: Request, res: Response) => {
  const userId = (req.user as User).id
  const page = parseInt(req.query.page as string) || 1 // Default to page 1
  const limit = parseInt(req.query.limit as string) || 10 // Default to 10 logs per page
  const offset = (page - 1) * limit

  try {
    const result = await pool.query(
      'SELECT * FROM water_intake_logs WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset],
    )

    const logs = result.rows
    res.status(200).json({ logs, page, limit })
    logger.info('Water intake logs retrieved', { userId, page, limit })
  } catch (error) {
    logger.error('Error retrieving water intake logs:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Centralized error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err)
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
  logger.info(`Server is running on port ${port}`)
})
