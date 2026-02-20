import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

// Register endpoint
app.post(
  '/register',
  [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { username, email, password } = req.body

    try {
      const hashedPassword = await bcrypt.hash(password, 10)
      const result = await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
        [username, email, hashedPassword],
      )

      // Generate JWT token
      const token = jwt.sign({ userId: result.rows[0].id }, jwtSecret, { expiresIn: '1h' })

      res.status(201).json({ message: 'User registered successfully', user: result.rows[0], token })
    } catch (error: any) {
      console.error(error)
      if (error.code === '23505') {
        // Unique violation
        return res.status(400).json({ error: 'Username or email already exists' })
      }
      res.status(500).json({ error: 'Failed to register user' })
    }
  },
)

// Login endpoint
app.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const user = result.rows[0]

      const passwordMatch = await bcrypt.compare(password, user.password)

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1h' })

      res.json({ message: 'Logged in successfully', user: { id: user.id, username: user.username, email: user.email }, token })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Failed to login' })
    }
  },
)

// Water intake logging endpoint (example)
app.post('/water-intake', async (req: Request, res: Response) => {
  // Authentication middleware would go here
  const { userId, quantity } = req.body

  try {
    const result = await pool.query(
      'INSERT INTO water_intake_logs (user_id, quantity_ml) VALUES ($1, $2) RETURNING *',
      [userId, quantity],
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to log water intake' })
  }
})

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Water Bottle App Backend!')
})

// Start the server
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}

export default app;
