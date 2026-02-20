import { Pool } from 'pg'
import config from 'config'

const dbConfig = config.get<{ host: string; port: number; name: string; user: string; password: string }>('db')

const pool = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.name,
  user: dbConfig.user,
  password: dbConfig.password,
})

export const query = async (text: string, params: any[]) => {
  try {
    const start = Date.now()
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Error executing query', text, error)
    throw error // Re-throw the error to be handled by the caller
  }
}
