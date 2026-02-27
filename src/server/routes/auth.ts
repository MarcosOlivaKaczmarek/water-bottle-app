import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { db } from '../db'
import config from 'config'

const router = express.Router()

// Passport configuration
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

passport.serializeUser((user: any, done: any) => {
  done(null, user.id)
})

passport.deserializeUser(async (id: number, done: any) => {
  try {
    const user = await db.query('SELECT * FROM users WHERE id = $1', [id])
    done(null, user.rows[0])
  } catch (error) {
    done(error)
  }
})

// Registration route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert the user into the database
    const newUser = await db.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', // Returning all columns
      [username, email, hashedPassword],
    )

    // Respond with the newly created user
    res.status(201).json(newUser.rows[0])
  } catch (err: any) {
    console.error(err.message)
    res.status(500).json({ message: err.message })
  }
})

// Login route
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      return res.status(400).json(info)
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        return next(err)
      }

      // Omit password from the user object in the token
      const { password, ...userWithoutPassword } = user

      // Sign the JWT with the user data (excluding the password)
      const token = jwt.sign(userWithoutPassword, config.get('auth.jwtSecret'))

      // Send the token to the client
      return res.json({ user: userWithoutPassword, token })
    })
  })(req, res, next)
})

// Logout route
router.post('/logout', (req, res) => {
  // Destroy the session
  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err)
      return res.status(500).json({ message: 'Logout failed' })
    }

    // Clear the JWT token from the client-side (e.g., by setting an empty token or removing it from local storage).
    // This part is typically handled in the frontend.

    res.status(200).json({ message: 'Logout successful' })
  })
})

export default router
