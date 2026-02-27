import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const dbHost = process.env.DB_HOST || 'localhost'
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432
const dbName = process.env.DB_NAME || 'water_bottle'
const dbUser = process.env.DB_USER || 'admin'
const dbPassword = process.env.DB_PASSWORD || 'password'

const pool = new Pool({
  host: dbHost,
  port: dbPort,
  database: dbName,
  user: dbUser,
  password: dbPassword,
})

export const logIntake = async (userId: number, quantity_ml: number) => {
  const query = 'INSERT INTO water_intake_logs (user_id, quantity_ml) VALUES ($1, $2) RETURNING *'
  const values = [userId, quantity_ml]

  try {
    const result = await pool.query(query, values)
    return result.rows[0]
  } catch (error) {
    console.error('Error logging water intake:', error)
    throw error
  }
}

export const getIntake = async (userId: number) => {
  const query = `
    SELECT SUM(quantity_ml) AS total_intake
    FROM water_intake_logs
    WHERE user_id = $1 AND DATE(timestamp) = CURRENT_DATE
  `
  const values = [userId]

  try {
    const result = await pool.query(query, values)
    return result.rows[0]?.total_intake || 0
  } catch (error) {
    console.error('Error getting water intake:', error)
    throw error
  }
}

export const getHistoricalIntake = async (userId: number, range: string) => {
  let query = ''
  let values: any[] = [userId]

  switch (range) {
    case 'daily':
      query = `
        SELECT timestamp, quantity_ml
        FROM water_intake_logs
        WHERE user_id = $1
        AND timestamp >= NOW() - INTERVAL '1 day'
        ORDER BY timestamp
      `
      break
    case 'weekly':
      query = `
        SELECT DATE(timestamp) as timestamp, SUM(quantity_ml) as quantity_ml
        FROM water_intake_logs
        WHERE user_id = $1
        AND timestamp >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(timestamp)
        ORDER BY DATE(timestamp)
      `
      break
    case 'monthly':
      query = `
        SELECT DATE_TRUNC('day', timestamp) as timestamp, SUM(quantity_ml) as quantity_ml
        FROM water_intake_logs
        WHERE user_id = $1
        AND timestamp >= NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', timestamp)
        ORDER BY DATE_TRUNC('day', timestamp)
      `
      break
    default:
      throw new Error('Invalid time range')
  }

  try {
    const result = await pool.query(query, values)
    return result.rows
  } catch (error) {
    console.error('Error getting historical water intake:', error)
    throw error
  }
}
