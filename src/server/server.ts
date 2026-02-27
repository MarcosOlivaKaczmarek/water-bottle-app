import express from 'express'
import { Request, Response, NextFunction } from 'express'
import { Pool } from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import authRoutes from './routes/auth'
import waterIntakeRoutes from './routes/waterIntake'
import goalRoutes from './routes/goals'
import bottleRoutes from './routes/waterBottleProfiles'
import reminderRoutes from './routes/hydrationReminders'
import recommendationRoutes from './routes/recommendations'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'water_bottle',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'password',
})

// Extend the Express Request interface to include the db property
declare global {
  namespace Express {
    interface Request {
      db: Pool
      user?: any // Adjust the type of 'user' as needed
    }
  }
}

// Middleware to attach the database pool to the request object
app.use((req: Request, res: Response, next: NextFunction) => {
  req.db = pool
  next()
})

// Passport configuration
passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const result = await pool.query(
          'SELECT id, email, password FROM users WHERE email = $1',
          [email],
        )
        if (result.rows.length === 0) {
          return done(null, false, { message: 'Incorrect email.' })
        }
        const user = result.rows[0]
        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
          return done(null, false, { message: 'Incorrect password.' })
        }
        return done(null, user)
      } catch (error) {
        return done(error)
      }
    },
  ),
)

passport.serializeUser((user: any, done: (error: any, id?: string) => void) => {
  done(null, user.id.toString())
})

passport.deserializeUser(
  async (id: string, done: (err: any, user?: any) => void) => {
    try {
      const result = await pool.query('SELECT id, email FROM users WHERE id = $1', [id])
      if (result.rows.length === 0) {
        return done(null, false)
      }
      const user = result.rows[0]
      done(null, user)
    } catch (error) {
      done(error)
    }
  },
)

// Express middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/water-intake', waterIntakeRoutes)
app.use('/api/goals', goalRoutes)
app.use('/api/water-bottle-profiles', bottleRoutes)
app.use('/api/hydration-reminders', reminderRoutes)
app.use('/api/recommendations', recommendationRoutes)

// Serve static files from the 'dist' directory
const __filename = new URL(import.meta.url).pathname
const __dirname = path.dirname(__filename)
const viteBuildPath = path.join(__dirname, '../../dist')
app.use(express.static(viteBuildPath))

// Handle all other routes by serving the index.html file
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(viteBuildPath, 'index.html'))
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
