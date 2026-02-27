import express, { Request, Response } from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { Strategy as LocalStrategy } from 'passport-local'
import { db } from '../db'

const router = express.Router()

// Configure Passport Local Strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await db.query('SELECT * FROM users WHERE username = $1', [
        username,
      ])

      if (user.rows.length === 0) {
        return done(null, false, { message: 'Incorrect username.' })
      }

      const validPassword = await bcrypt.compare(
        password,
        user.rows[0].password,
      )

      if (!validPassword) {
        return done(null, false, { message: 'Incorrect password.' })
      }

      return done(null, user.rows[0])
    } catch (error) {
      return done(error)
    }
  }),
)

// Serialize user for session
passport.serializeUser((user: any, done: any) => {
  done(null, user.id)
})

// Deserialize user from session
passport.deserializeUser(async (id: number, done: any) => {
  try {
    const user = await db.query('SELECT * FROM users WHERE id = $1', [id])
    done(null, user.rows[0])
  } catch (error) {
    done(error)
  }
})

router.post('/login', (req: Request, res: Response, next: any) => {
  passport.authenticate(
    'local',
    { session: false },
    (err: Error, user: any, info: any) => {
      if (err) {
        return next(err)
      }
      if (!user) {
        return res.status(400).json({ message: info.message })
      }

      req.login(user, { session: false }, (err) => {
        if (err) {
          return next(err)
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key', {
          expiresIn: '1h',
        })

        return res.json({ token })
      })
    },
  )(req, res, next)
})

export default router
