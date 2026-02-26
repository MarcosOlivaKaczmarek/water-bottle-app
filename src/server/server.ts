import express, { Request, Response, NextFunction } from 'express'
import { Pool } from 'pg'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Lazy initialization of the PostgreSQL connection pool
let pgPool: Pool | null = null

async function getPgPool(): Promise<Pool> {
  if (!pgPool) {
    pgPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'water_bottle',
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || 'password',
      max: 20, // Max number of clients in the pool
      idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
      connectionTimeoutMillis: 2000, // Maximum amount of time to wait for a connection before throwing an error
    })

    // Test the connection
    try {
      await pgPool.query('SELECT NOW()')
      console.log('Connected to PostgreSQL')
    } catch (err) {
      console.error('Failed to connect to PostgreSQL', err)
      pgPool = null // Reset pool on failure
      throw err // Re-throw the error to prevent the app from starting
    }
  }
  return pgPool
}

// Middleware to provide the pgPool to route handlers
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.pgPool = await getPgPool()
    next()
  } catch (err) {
    console.error('Failed to acquire pgPool', err)
    return res.status(500).json({ error: 'Failed to connect to database' })
  }
})

// Define a custom Request interface to include the pgPool
declare global {
  namespace Express {
    interface Request {
      pgPool: Pool
    }
  }
}

// Example route
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const result = await req.pgPool.query('SELECT NOW()')
    res.json({ status: 'ok', dbTime: result.rows[0].now })
  } catch (error) {
    console.error('Health check failed', error)
    res.status(500).json({ status: 'error' })
  }
})

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

export default app
