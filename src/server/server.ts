import express from 'express'
import { db } from './db'
import authRoutes from './routes/authRoutes'
import waterIntakeRoutes from './routes/waterIntakeRoutes'
import requireAuth from './middleware/requireAuth'
import waterBottleRoutes from './routes/waterBottleRoutes'
import path from 'path'

const app = express()
const port = process.env.PORT || 3000 // Use environment variable for port

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files from the 'dist' directory
const __dirname = path.resolve()
app.use(express.static(path.join(__dirname, 'dist')))

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/water-intake', requireAuth, waterIntakeRoutes)
app.use('/api/water-bottles', waterBottleRoutes)

// Handle all other requests by serving the 'index.html' file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
