import express, { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'

const app = express()
const port = 3001

app.use(express.json())

// PostgreSQL connection pool
const pool = new Pool({
  user: 'your_db_user',
  host: 'localhost',
  database: 'your_db_name',
  password: 'your_db_password',
  port: 5432,
})

// Generate a JWT secret.  Ideally, this should come from an environment variable.
const jwtSecret = 'your-jwt-secret' // Replace with a strong, randomly generated secret

// Function to generate JWT token
const generateToken = (user: { id: number; username: string }) => {
  return jwt.sign(user, jwtSecret, { expiresIn: '1h' })
}

// Register endpoint
app.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert the user into the database
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username', // Returning username
      [username, email, hashedPassword],
    )

    const user = result.rows[0]

    // Generate JWT token
    const token = generateToken(user)

    res.status(201).json({ message: 'User created successfully', token: token, user: user }) // Include user in response
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Registration failed' })
  }
})

// Login endpoint
app.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Find the user by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Generate JWT token
    const token = generateToken({ id: user.id, username: user.username })

    res.status(200).json({ message: 'Logged in successfully', token: token, user: {id: user.id, username: user.username} })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Login failed' })
  }
})

// Logout (client-side, typically involves discarding the token)
app.post('/logout', (req: Request, res: Response) => {
  // In a stateless JWT setup, the server doesn't need to do anything.
  // The client simply discards the token.
  res.status(200).json({ message: 'Logged out successfully' })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
