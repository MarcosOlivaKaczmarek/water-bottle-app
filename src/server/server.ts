import express from 'express'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Server } from 'socket.io'
import { query } from './db'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server)

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.static(join(__dirname, '../..', 'dist')))

app.use('/api', authRoutes)

app.get('/hello', async (req, res) => {
  try {
    const result = await query('SELECT NOW()')
    res.json({ message: 'Hello from Express with TypeScript!', time: result.rows[0].now })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database connection failed' })
  }
})

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../..', 'dist', 'index.html'))
})

io.on('connection', (socket) => {
  console.log('A user connected')

  socket.on('disconnect', () => {
    console.log('User disconnected')
  })
})

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
