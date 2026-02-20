import express, { Request, Response, NextFunction } from 'express'
import { schedule } from 'node-cron'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import { CronJob } from 'cron'
import { validate, format } from 'cron-parser'
import winston from 'winston'
import expressWinston from 'express-winston'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Exiting...')
  process.exit(1)
}

const jwtSecret = process.env.JWT_SECRET
const saltRounds = 10

// Database configuration
const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'water_bottle',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'password',
})

// Logging configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'server.log' }),
  ],
})

// Express-Winston logger
app.use(
  expressWinston.logger({
    winstonInstance: logger,
    statusLevels: true,
  }),
)

app.use(express.json())

// Custom type for req.user
interface User {
  id: number
  email: string
}

declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

// Middleware to verify JWT token
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (authHeader) {
    const token = authHeader.split(' ')[1]

    jwt.verify(token, jwtSecret, (err: any, user: any) => {
      if (err) {
        logger.warn('Invalid token')
        return res.sendStatus(403)
      }

      req.user = user as User // Type assertion after verification
      next()
    })
  } else {
    logger.warn('No token provided')
    res.sendStatus(401)
  }
}

// Sanitize input using DOMPurify
const sanitizeStringForDatabase = (input: string): string => {
  const { window } = new JSDOM('')
  const domPurify = DOMPurify(window as any)
  return domPurify.sanitize(input)
}

// Register endpoint
app.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      logger.warn('Missing username, email, or password')
      return res
        .status(400)
        .json({ message: 'Missing username, email, or password' })
    }

    const sanitizedUsername = sanitizeStringForDatabase(username)
    const sanitizedEmail = sanitizeStringForDatabase(email)

    // Check if user already exists
    const userExistsQuery = 'SELECT * FROM users WHERE email = $1'
    const userExistsResult = await db.query(userExistsQuery, [sanitizedEmail])

    if (userExistsResult.rows.length > 0) {
      logger.warn('User already exists')
      return res.status(400).json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email'
    const values = [sanitizedUsername, sanitizedEmail, hashedPassword]

    const result = await db.query(query, values)

    logger.info(`User registered: ${sanitizedEmail}`)
    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0],
    })
  } catch (err: any) {
    logger.error(`Error registering user: ${err.message}`)
    res.status(500).json({ message: 'Error registering user' })
  }
})

// Login endpoint
app.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      logger.warn('Missing email or password')
      return res.status(400).json({ message: 'Missing email or password' })
    }

    const sanitizedEmail = sanitizeStringForDatabase(email)

    const query = 'SELECT * FROM users WHERE email = $1'
    const values = [sanitizedEmail]

    const result = await db.query(query, values)

    if (result.rows.length === 0) {
      logger.warn('Invalid credentials')
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const user = result.rows[0]

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      logger.warn('Invalid credentials')
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, {
      expiresIn: '1h',
    })

    logger.info(`User logged in: ${sanitizedEmail}`)
    res.json({ message: 'Logged in successfully', token })
  } catch (err: any) {
    logger.error(`Error logging in user: ${err.message}`)
    res.status(500).json({ message: 'Error logging in user' })
  }
})

interface Reminder {
  id: number
  user_id: number
  cron_expression: string
  quantity_ml: number
}

// Endpoint to create a new reminder
app.post(
  '/reminders',
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id // Access user ID from request
      const { cron_expression, quantity_ml } = req.body

      if (!cron_expression || !quantity_ml) {
        logger.warn('Missing cron expression or quantity_ml')
        return res
          .status(400)
          .json({ message: 'Missing cron expression or quantity_ml' })
      }

      // Validate cron expression
      if (!validate(cron_expression)) {
        logger.warn('Invalid cron expression')
        return res.status(400).json({ message: 'Invalid cron expression' })
      }

      const query =
        'INSERT INTO hydration_reminders (user_id, cron_expression, quantity_ml) VALUES ($1, $2, $3) RETURNING *'
      const values = [userId, cron_expression, quantity_ml]

      const result = await db.query(query, values)
      const newReminder: Reminder = result.rows[0]

      // Schedule the reminder
      scheduleReminder(newReminder)

      logger.info(`Reminder created for user ${userId}`)
      res.status(201).json({
        message: 'Reminder created successfully',
        reminder: newReminder,
      })
    } catch (err: any) {
      logger.error(`Error creating reminder: ${err.message}`)
      res.status(500).json({ message: 'Error creating reminder' })
    }
  },
)

// Endpoint to get all reminders for a user
app.get(
  '/reminders',
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id // Access user ID from request

      // Implement pagination
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const offset = (page - 1) * limit

      const query = `SELECT * FROM hydration_reminders WHERE user_id = $1 LIMIT $2 OFFSET $3`
      const values = [userId, limit, offset]

      const result = await db.query(query, values)
      const reminders: Reminder[] = result.rows

      logger.info(`Retrieved ${reminders.length} reminders for user ${userId}`)
      res.json(reminders)
    } catch (err: any) {
      logger.error(`Error getting reminders: ${err.message}`)
      res.status(500).json({ message: 'Error getting reminders' })
    }
  },
)

// Endpoint to update a reminder
app.put(
  '/reminders/:id',
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id // Access user ID from request
      const reminderId = parseInt(req.params.id)
      const { cron_expression, quantity_ml } = req.body

      if (!cron_expression || !quantity_ml) {
        logger.warn('Missing cron expression or quantity_ml')
        return res
          .status(400)
          .json({ message: 'Missing cron expression or quantity_ml' })
      }

      // Validate cron expression
      if (!validate(cron_expression)) {
        logger.warn('Invalid cron expression')
        return res.status(400).json({ message: 'Invalid cron expression' })
      }

      const query =
        'UPDATE hydration_reminders SET cron_expression = $1, quantity_ml = $2 WHERE id = $3 AND user_id = $4 RETURNING *'
      const values = [cron_expression, quantity_ml, reminderId, userId]

      const result = await db.query(query, values)

      if (result.rows.length === 0) {
        logger.warn(`Reminder not found or not owned by user ${userId}`)
        return res
          .status(404)
          .json({ message: 'Reminder not found or not owned by user' })
      }

      const updatedReminder: Reminder = result.rows[0]

      // Reschedule the reminder
      cancelReminder(reminderId)
      scheduleReminder(updatedReminder)

      logger.info(`Reminder ${reminderId} updated for user ${userId}`)
      res.json({
        message: 'Reminder updated successfully',
        reminder: updatedReminder,
      })
    } catch (err: any) {
      logger.error(`Error updating reminder: ${err.message}`)
      res.status(500).json({ message: 'Error updating reminder' })
    }
  },
)

// Endpoint to delete a reminder
app.delete(
  '/reminders/:id',
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id // Access user ID from request
      const reminderId = parseInt(req.params.id)

      const query =
        'DELETE FROM hydration_reminders WHERE id = $1 AND user_id = $2 RETURNING *'
      const values = [reminderId, userId]

      const result = await db.query(query, values)

      if (result.rows.length === 0) {
        logger.warn(`Reminder not found or not owned by user ${userId}`)
        return res
          .status(404)
          .json({ message: 'Reminder not found or not owned by user' })
      }

      // Cancel the reminder
      cancelReminder(reminderId)

      logger.info(`Reminder ${reminderId} deleted for user ${userId}`)
      res.json({ message: 'Reminder deleted successfully' })
    } catch (err: any) {
      logger.error(`Error deleting reminder: ${err.message}`)
      res.status(500).json({ message: 'Error deleting reminder' })
    }
  },
)

// Store scheduled jobs
const scheduledJobs: { [key: number]: CronJob } = {}

// Function to schedule a reminder
const scheduleReminder = (reminder: Reminder) => {
  try {
    const job = new CronJob(
      reminder.cron_expression,
      () => {
        // This function will be executed when the cron expression matches
        logger.info(
          `Reminder triggered for user ${reminder.user_id}: Drink ${reminder.quantity_ml}ml`,
        )
        // TODO: Implement notification logic here (e.g., send a push notification)
      },
      null,
      true, // Start the job right now
      'UTC', // Time zone
    )

    scheduledJobs[reminder.id] = job
    job.start()
    logger.info(`Reminder ${reminder.id} scheduled with cron ${reminder.cron_expression}`)
  } catch (err: any) {
    logger.error(`Error scheduling reminder ${reminder.id}: ${err.message}`)
    // TODO: Implement retry mechanism or alerting system for failed tasks
  }
}

// Function to cancel a reminder
const cancelReminder = (reminderId: number) => {
  if (scheduledJobs[reminderId]) {
    scheduledJobs[reminderId].stop()
    delete scheduledJobs[reminderId]
    logger.info(`Reminder ${reminderId} cancelled`)
  } else {
    logger.warn(`Reminder ${reminderId} not found for cancellation`)
  }
}

// Load existing reminders from the database and schedule them on server startup
const loadReminders = async () => {
  try {
    const query = 'SELECT * FROM hydration_reminders'
    const result = await db.query(query)
    const reminders: Reminder[] = result.rows

    reminders.forEach((reminder) => {
      scheduleReminder(reminder)
    })

    logger.info(`Loaded and scheduled ${reminders.length} reminders from the database`)
  } catch (err: any) {
    logger.error(`Error loading reminders from the database: ${err.message}`)
    // TODO: Consider a more robust error handling strategy, such as retrying or exiting the application
  }
}

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`)
  loadReminders()
})
