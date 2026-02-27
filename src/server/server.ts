import express from 'express'
import { createServer } from 'node:http'
import path from 'path'
import authRoutes from './routes/auth'
import dotenv from 'dotenv'
import passport from 'passport'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000
const server = createServer(app)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())

// Serve static files from the 'dist' directory
const __dirname = path.dirname(new URL(import.meta.url).pathname)
const staticPath = path.join(__dirname, '..', '..', 'dist')
app.use(express.static(staticPath))

// API routes
app.use('/api', authRoutes)

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'))
})

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
