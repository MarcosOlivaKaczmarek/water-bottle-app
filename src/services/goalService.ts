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

export const setDailyGoal = async (userId: number, daily_goal_ml: number) => {
  const query = `
    INSERT INTO goals (user_id, daily_goal_ml, start_date)
    VALUES ($1, $2, NOW()::DATE)
    ON CONFLICT (user_id) DO UPDATE
    SET daily_goal_ml = $2, start_date = NOW()::DATE
    RETURNING *
  `
  const values = [userId, daily_goal_ml]

  try {
    const result = await pool.query(query, values)
    return result.rows[0]
  } catch (error) {
    console.error('Error setting daily goal:', error)
    throw error
  }
}

export const getDailyGoal = async (userId: number) => {
  const query = `
    SELECT daily_goal_ml
    FROM goals
    WHERE user_id = $1
    ORDER BY start_date DESC
    LIMIT 1
  `
  const values = [userId]

  try {
    const result = await pool.query(query, values)
    return result.rows[0]?.daily_goal_ml || 2000 // Default goal
  } catch (error) {
    console.error('Error getting daily goal:', error)
    throw error
  }
}
