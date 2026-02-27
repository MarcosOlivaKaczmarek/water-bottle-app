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

export const createUser = async (user: { username: string; email: string; password: string }) => {
  const { username, email, password } = user
  const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *'
  const values = [username, email, password]

  try {
    const result = await pool.query(query, values)
    return result.rows[0]
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export const findUserByUsername = async (username: string) => {
  const query = 'SELECT * FROM users WHERE username = $1'
  const values = [username]

  try {
    const result = await pool.query(query, values)
    return result.rows[0]
  } catch (error) {
    console.error('Error finding user by username:', error)
    throw error
  }
}

export const findUserById = async (id: number) => {
  const query = 'SELECT * FROM users WHERE id = $1'
  const values = [id]

  try {
    const result = await pool.query(query, values)
    return result.rows[0]
  } catch (error) {
    console.error('Error finding user by id:', error)
    throw error
  }
}

export const updateUser = async (id: number, updates: { [key: string]: any }) => {
  const setClauses = Object.keys(updates)
    .map((key, index) => `${key} = $${index + 2}`)
    .join(', ')
  const values = [id, ...Object.values(updates)]

  const query = `UPDATE users SET ${setClauses} WHERE id = $1 RETURNING *`

  try {
    const result = await pool.query(query, values)
    return result.rows[0]
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}
