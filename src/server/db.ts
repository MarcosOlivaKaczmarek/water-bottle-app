import { Pool } from 'pg'
import config from 'config'
import { logger } from '../logger'

const dbConfig = config.get<{ host: string; port: number; name: string; user: string; password?: string }>('db')

const pool = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.name,
  user: dbConfig.user,
  password: dbConfig.password,
  max: 20, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // max amount of time to wait for a connection before throwing an error
})

pool.on('error', (err, client) => {
  logger.error(`Unexpected error on idle client ${client.processID}`, err)
  process.exit(-1)
})

export const initDb = async () => {
  try {
    await pool.connect()
    logger.info('Database connected')
  } catch (error) {
    logger.error('Failed to connect to the database', error)
    process.exit(1)
  }
}

export const query = async (text: string, params: any[]) => {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    logger.info('executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    logger.error('Error executing query', { text, error })
    throw error
  }
}

export default pool
