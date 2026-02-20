import express from 'express'
import { Request, Response } from 'express'
import { Pool } from 'pg'

const app = express()
const port = 3000

// Environment variables for database connection
const dbHost = process.env.DB_HOST || 'localhost'
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432
const dbUser = process.env.DB_USER || 'postgres'
const dbPassword = process.env.DB_PASSWORD || 'postgres'
const dbName = process.env.DB_NAME || 'water_bottle'

const pool = new Pool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
})

app.use(express.json())

// Endpoint to log water intake
app.post('/api/water-intake', async (req: Request, res: Response) => {
  try {
    const { userId, quantityMl, timestamp } = req.body

    if (!userId || !quantityMl) {
      return res
        .status(400)
        .json({ error: 'User ID and quantity are required' })
    }

    // Insert the water intake log into the database
    const query = `
      INSERT INTO water_intake_logs (user_id, quantity_ml, timestamp)
      VALUES ($1, $2, $3)
      RETURNING *;
    `

    const values = [userId, quantityMl, timestamp || new Date()]
    const result = await pool.query(query, values)

    res.status(201).json(result.rows[0]) // Respond with the newly created log
  } catch (error) {
    console.error('Error logging water intake:', error)
    res.status(500).json({ error: 'Failed to log water intake' })
  }
})

// Endpoint to get water intake trends (daily, weekly, monthly)
app.get('/api/water-intake-trends', async (req: Request, res: Response) => {
  try {
    const { userId, period } = req.query

    if (!userId || !period) {
      return res
        .status(400)
        .json({ error: 'User ID and period are required' })
    }

    const userIdNum = parseInt(userId as string, 10)

    let query = ''
    let values: any[] = [userIdNum]

    switch (period) {
      case 'daily':
        query = `
          SELECT date(timestamp) as date, SUM(quantity_ml) as total_quantity
          FROM water_intake_logs
          WHERE user_id = $1
          GROUP BY date(timestamp)
          ORDER BY date(timestamp) DESC;
        `
        break
      case 'weekly':
        query = `
          SELECT date_trunc('week', timestamp) as week_start, SUM(quantity_ml) as total_quantity
          FROM water_intake_logs
          WHERE user_id = $1
          GROUP BY date_trunc('week', timestamp)
          ORDER BY date_trunc('week', timestamp) DESC;
        `
        break
      case 'monthly':
        query = `
          SELECT date_trunc('month', timestamp) as month_start, SUM(quantity_ml) as total_quantity
          FROM water_intake_logs
          WHERE user_id = $1
          GROUP BY date_trunc('month', timestamp)
          ORDER BY date_trunc('month', timestamp) DESC;
        `
        break
      default:
        return res.status(400).json({ error: 'Invalid period' })
    }

    const result = await pool.query(query, values)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching water intake trends:', error)
    res.status(500).json({ error: 'Failed to fetch water intake trends' })
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
