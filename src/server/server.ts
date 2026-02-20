import express from 'express'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = 3000

app.use(express.json())

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
})

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword],
    )

    res.json(newUser.rows[0])
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email])

    if (user.rows.length === 0) {
      return res.status(400).send('Cannot find user')
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password)

    if (!validPassword) {
      return res.status(400).send('Incorrect password')
    }

    const accessToken = jwt.sign({ email: user.rows[0].email }, process.env.JWT_SECRET as string)
    res.json({ accessToken: accessToken })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Water Bottle Profiles API

// GET all water bottle profiles for a user
app.get('/water-bottle-profiles', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id // Assuming user ID is available in req.user after authentication
    const profiles = await pool.query(
      'SELECT * FROM water_bottle_profiles WHERE user_id = $1',
      [userId],
    )
    res.json(profiles.rows)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// GET a specific water bottle profile by ID
app.get('/water-bottle-profiles/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params
    const userId = req.user.id // Assuming user ID is available in req.user after authentication
    const profile = await pool.query(
      'SELECT * FROM water_bottle_profiles WHERE id = $1 AND user_id = $2',
      [id, userId],
    )

    if (profile.rows.length === 0) {
      return res.status(404).send('Profile not found')
    }

    res.json(profile.rows[0])
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// POST a new water bottle profile
app.post('/water-bottle-profiles', authenticateToken, async (req: any, res: any) => {
  try {
    const { name, capacity_ml } = req.body
    const userId = req.user.id // Assuming user ID is available in req.user after authentication

    const newProfile = await pool.query(
      'INSERT INTO water_bottle_profiles (user_id, name, capacity_ml) VALUES ($1, $2, $3) RETURNING *',
      [userId, name, capacity_ml],
    )

    res.status(201).json(newProfile.rows[0])
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// PUT (update) an existing water bottle profile
app.put('/water-bottle-profiles/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params
    const { name, capacity_ml } = req.body
    const userId = req.user.id // Assuming user ID is available in req.user after authentication

    const updatedProfile = await pool.query(
      'UPDATE water_bottle_profiles SET name = $1, capacity_ml = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [name, capacity_ml, id, userId],
    )

    if (updatedProfile.rows.length === 0) {
      return res.status(404).send('Profile not found')
    }

    res.json(updatedProfile.rows[0])
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// DELETE a water bottle profile
app.delete('/water-bottle-profiles/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params
    const userId = req.user.id // Assuming user ID is available in req.user after authentication

    const deletedProfile = await pool.query(
      'DELETE FROM water_bottle_profiles WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId],
    )

    if (deletedProfile.rows.length === 0) {
      return res.status(404).send('Profile not found')
    }

    res.json({ message: 'Profile deleted' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
