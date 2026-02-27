import express from 'express'
import { Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'
import { authRoutes } from './routes/authRoutes'
import { userRoutes } from './routes/userRoutes'
import { waterIntakeRoutes } from './routes/waterIntakeRoutes'
import { goalRoutes } from './routes/goalRoutes'
import { waterBottleProfileRoutes } from './routes/waterBottleProfileRoutes'
import { hydrationReminderRoutes } from './routes/hydrationReminderRoutes'
import passport from 'passport'
import { configurePassport } from './config/passport'
import cors from 'cors'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Passport configuration
configurePassport(passport)
app.use(passport.initialize())

// Routes
app.use('/auth', authRoutes)
app.use('/users', passport.authenticate('jwt', { session: false }), userRoutes)
app.use('/water-intake', passport.authenticate('jwt', { session: false }), waterIntakeRoutes)
app.use('/goals', passport.authenticate('jwt', { session: false }), goalRoutes)
app.use('/water-bottle-profiles', passport.authenticate('jwt', { session: false }), waterBottleProfileRoutes)
app.use('/hydration-reminders', passport.authenticate('jwt', { session: false }), hydrationReminderRoutes)

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
