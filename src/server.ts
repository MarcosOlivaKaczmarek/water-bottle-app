import express, { Request, Response, NextFunction } from 'express'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'
import jwt, { JwtPayload, JsonWebTokenError } from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import dotenv from 'dotenv'
import config from 'config'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

dotenv.config()

const app = express()
const port = config.get('port') || 3000
const jwtSecret: string = config.get('auth.jwtSecret')

if (!jwtSecret) {
  console.error('JWT secret is not defined. Exiting...')
  process.exit(1)
}

app.use(express.json())

const dbConfig = {
  host: config.get('db.host') || 'localhost',
  port: config.get('db.port') ? parseInt(config.get('db.port') as string) : 5432,
  database: config.get('db.name') || 'water_bottle',
  user: config.get('db.user') || 'postgres',
  password: config.get('db.password') || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

let pool: Pool

async function createPool(): Promise<Pool> {
  try {
    const newPool = new Pool(dbConfig)
    await newPool.connect() // Test the connection
    console.log('Database connection pool created successfully')
    return newPool
  } catch (error: any) {
    console.error('Error creating database connection pool:', error.message)
    console.error('Retrying in 5 seconds...')
    await new Promise((resolve) => setTimeout(resolve, 5000))
    return createPool() // Retry recursively
  }
}

createPool().then((p) => {
  pool = p
}).catch(() => {
  console.error('Failed to create database pool after multiple retries. Exiting...')
  process.exit(1)
})

// Token blacklist (simplified in-memory implementation)
const tokenBlacklist = new Set<string>()

// Middleware to verify JWT token
interface CustomRequest extends Request {
  user?: JwtPayload
}

const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (authHeader) {
    const token = authHeader.split(' ')[1]

    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ message: 'Token is blacklisted' })
    }

    jwt.verify(token, jwtSecret, (err: any, user: any) => {
      if (err) {
        if (err instanceof jwt.TokenExpiredError) {
          return res.status(401).json({ message: 'Token has expired' })
        } else if (err instanceof jwt.JsonWebTokenError) {
          return res.status(403).json({ message: 'Invalid token' })
        } else {
          return res.status(403).json({ message: 'Invalid token' })
        }
      }

      req.user = user as JwtPayload // Type assertion here
      next()
    })
  } else {
    res.status(401).json({ message: 'Token not provided' })
  }
}

// Input validation middleware
const validateInput = (
  req: Request,
  res: Response,
  next: NextFunction,
  validations: any[],
) => {
  Promise.all(validations.map((validation) => validation.run(req))).then(() => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    next()
  })
}

// User registration endpoint
app.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters'),
    body('email').trim().isEmail().withMessage('Invalid email address'),
    body('password')
      .trim()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  (req: Request, res: Response, next: NextFunction) => {
    validateInput(req, res, next, [
      body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters'),
      body('email').trim().isEmail().withMessage('Invalid email address'),
      body('password')
        .trim()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    ])
  },
  async (req: Request, res: Response) => {
    const { username, email, password } = req.body

    try {
      const hashedPassword = await bcrypt.hash(password, 10)

      const result = await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email', // Returning email as well
        [username, email, hashedPassword],
      )

      const user = result.rows[0]

      const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, { expiresIn: '1h' })

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
  (req: Request, res: Response, next: NextFunction) => {
    validateInput(req, res, next, [
      body('email').trim().isEmail().withMessage('Invalid email address'),
      body('password').trim().notEmpty().withMessage('Password is required'),
    ])
  },
  async (req: Request, res: Response) => {
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

      const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, { expiresIn: '1h' })

      // Include email in the response for consistency
      res
        .status(200)
        .json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email }, token })
    } catch (error) {
      console.error('Error logging in:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
)

// Logout endpoint (client-side implementation with server-side token invalidation)
app.post('/logout', verifyToken, (req: CustomRequest, res: Response) => {
  const authHeader = req.headers.authorization
  if (authHeader) {
    const token = authHeader.split(' ')[1]
    tokenBlacklist.add(token)
    console.log('Token blacklisted.')
  }
  res.status(200).json({ message: 'Logout successful' })
})

interface WaterGoalRequest extends Request {
  user?: { id: number }
  body: {
    weightKg: number
    activityLevel: string
    climate: string
    customGoalMl?: number // Optional custom goal
  }
}

// Endpoint to set personalized daily water intake goal
app.post(
  '/set-daily-goal',
  verifyToken,
  [
    body('weightKg').isNumeric().withMessage('Weight must be a number'),
    body('activityLevel')
      .trim()
      .isIn(['sedentary', 'light', 'moderate', 'active', 'very active'])
      .withMessage('Invalid activity level'),
    body('climate').trim().notEmpty().withMessage('Climate is required'),
    body('customGoalMl')
      .optional()
      .isNumeric()
      .withMessage('Custom goal must be a number'),
  ],
  (req: Request, res: Response, next: NextFunction) => {
    validateInput(req, res, next, [
      body('weightKg').isNumeric().withMessage('Weight must be a number'),
      body('activityLevel')
        .trim()
        .isIn(['sedentary', 'light', 'moderate', 'active', 'very active'])
        .withMessage('Invalid activity level'),
      body('climate').trim().notEmpty().withMessage('Climate is required'),
      body('customGoalMl')
        .optional()
        .isNumeric()
        .withMessage('Custom goal must be a number'),
    ])
  },
  async (req: WaterGoalRequest, res: Response) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'User not authenticated' })
      }

      const userId = req.user.id
      const { weightKg, activityLevel, climate, customGoalMl } = req.body

      // Sanitize climate input using DOMPurify
      const window = new JSDOM('').window
      const domPurify = DOMPurify(window as any)
      const sanitizedClimate = domPurify.sanitize(climate)

      // Calculate recommended water intake (more sophisticated calculation)
      let recommendedIntake = weightKg * 30 // Base intake in ml

      switch (activityLevel) {
        case 'light':
          recommendedIntake *= 1.1
          break
        case 'moderate':
          recommendedIntake *= 1.2
          break
        case 'active':
          recommendedIntake *= 1.3
          break
        case 'very active':
          recommendedIntake *= 1.4
          break
      }

      // Adjust for climate (example: hot climate increases intake by 20%)
      if (sanitizedClimate.toLowerCase().includes('hot')) {
        recommendedIntake *= 1.2
      }

      // Use custom goal if provided, otherwise use calculated value
      const dailyGoalMl = customGoalMl !== undefined ? customGoalMl : Math.round(recommendedIntake)

      // Store the goal in the database
      const result = await pool.query(
        'INSERT INTO goals (user_id, daily_goal_ml, start_date) VALUES ($1, $2, NOW()) RETURNING id, user_id, daily_goal_ml, start_date',
        [userId, dailyGoalMl],
      )

      const goal = result.rows[0]

      res.status(200).json({
        message: 'Daily water intake goal set successfully',
        goal,
        recommendedIntake: Math.round(recommendedIntake),
      })
    } catch (error: any) {
      console.error('Error setting daily goal:', error)
      res.status(500).json({ message: 'Failed to set daily water intake goal' })
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

  if (err instanceof SyntaxError && err.message.includes('JSON')) {
    return res.status(400).json({ message: 'Invalid JSON payload' })
  }

  // Specific database error handling (example)
  if (err.code === '22P02') {
    // Invalid text representation (e.g., invalid input to a numeric field)
    return res.status(400).json({ message: 'Invalid data format' })
  }

  res.status(500).json({ message: 'Something went wrong!' })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
