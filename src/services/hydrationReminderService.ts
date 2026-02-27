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

export const createReminder = async (userId: number, cron_expression: string, quantity_ml: number) => {
  const query = 'INSERT INTO hydration_reminders (user_id, cron_expression, quantity_ml) VALUES ($1, $2, $3) RETURNING *'
  const values = [userId, cron_expression, quantity_ml]

  try {
    const result = await pool.query(query, values)
    return result.rows[0]
  } catch (error) {
    console.error('Error creating hydration reminder:', error)
    throw error
  }
}

export const getReminders = async (userId: number) => {
  const query = 'SELECT * FROM hydration_reminders WHERE user_id = $1'
  const values = [userId]

  try {
    const result = await pool.query(query, values)
    return result.rows
  } catch (error) {
    console.error('Error getting hydration reminders:', error)
    throw error
  }
}

export const deleteReminder = async (userId: number, id: number) => {
  const query = 'DELETE FROM hydration_reminders WHERE user_id = $1 AND id = $2'
  const values = [userId, id]

  try {
    await pool.query(query, values)
  } catch (error) {
    console.error('Error deleting hydration reminder:', error)
    throw error
  }
}
