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

export const createProfile = async (userId: number, name: string, capacity_ml: number, image: string | undefined) => {
  const query = 'INSERT INTO water_bottle_profiles (user_id, name, capacity_ml, image) VALUES ($1, $2, $3, $4) RETURNING *'
  const values = [userId, name, capacity_ml, image]

  try {
    const result = await pool.query(query, values)
    return result.rows[0]
  } catch (error) {
    console.error('Error creating water bottle profile:', error)
    throw error
  }
}

export const getProfiles = async (userId: number) => {
  const query = 'SELECT * FROM water_bottle_profiles WHERE user_id = $1'
  const values = [userId]

  try {
    const result = await pool.query(query, values)
    return result.rows
  } catch (error) {
    console.error('Error getting water bottle profiles:', error)
    throw error
  }
}

export const deleteProfile = async (userId: number, id: number) => {
  const query = 'DELETE FROM water_bottle_profiles WHERE user_id = $1 AND id = $2'
  const values = [userId, id]

  try {
    await pool.query(query, values)
  } catch (error) {
    console.error('Error deleting water bottle profile:', error)
    throw error
  }
}
