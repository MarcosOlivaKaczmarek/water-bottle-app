import request from 'supertest'
import express from 'express'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'

// Mock the database connection pool
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    end: jest.fn(),
  }
  return {
    Pool: jest.fn(() => mPool),
  }
})

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}))

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mockedToken'),
}))

describe('Auth Endpoints', () => {
  let app: express.Application
  let pool: jest.Mocked<Pool>

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()

    // Create a new express app
    app = express()
    app.use(express.json())

    // Import the route handlers (assuming they are in a separate file)
    const dbUrl = process.env.DATABASE_URL
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'

    // Database connection pool
    pool = new Pool() as jest.Mocked<Pool>

    // User registration endpoint
    app.post(
      '/register',
      [
        body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
      ],
      async (req: express.Request, res: express.Response) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() })
        }

        const { username, email, password } = req.body

        try {
          // Hash the password
          const hashedPassword = await bcrypt.hash(password, 10)

          // Insert the user into the database
          const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword],
          )

          // Generate a JWT token
          const token = jwt.sign({ userId: result.rows[0].id }, jwtSecret, { expiresIn: '1h' })

          res.status(201).json({ message: 'User registered successfully', user: result.rows[0], token })
        } catch (error) {
          console.error('Registration failed:', error)
          res.status(500).json({ message: 'Registration failed', error: (error as Error).message })
        }
      },
    )

    // User login endpoint
    app.post(
      '/login',
      [
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').notEmpty().withMessage('Password is required'),
      ],
      async (req: express.Request, res: express.Response) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() })
        }

        const { email, password } = req.body

        try {
          // Find the user by email
          const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
          if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' })
          }

          const user = result.rows[0]

          // Compare the password with the hashed password
          const passwordMatch = await bcrypt.compare(password, user.password)
          if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' })
          }

          // Generate a JWT token
          const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1h' })

          res.status(200).json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email }, token })
        } catch (error) {
          console.error('Login failed:', error)
          res.status(500).json({ message: 'Login failed', error: (error as Error).message })
        }
      },
    )
  })

  it('should register a new user', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword')
    const mockQueryResult = { rows: [{ id: 123, username: 'testuser', email: 'test@example.com' }] }
    ;(pool.query as jest.Mock).mockResolvedValue(mockQueryResult)

    const response = await request(app).post('/register').send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    })

    expect(response.statusCode).toBe(201)
    expect(response.body.message).toBe('User registered successfully')
    expect(response.body.user).toEqual(mockQueryResult.rows[0])
    expect(response.body.token).toBe('mockedToken')
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10)
    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      ['testuser', 'test@example.com', 'hashedPassword'],
    )
    expect(jwt.sign).toHaveBeenCalledWith({ userId: 123 }, 'your-secret-key', { expiresIn: '1h' })
  })

  it('should handle registration errors', async () => {
    (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'))

    const response = await request(app).post('/register').send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    })

    expect(response.statusCode).toBe(500)
    expect(response.body.message).toBe('Registration failed')
    expect(response.body.error).toBe('Database error')
  })

  it('should login an existing user', async () => {
    const mockQueryResult = { rows: [{ id: 123, username: 'testuser', email: 'test@example.com', password: 'hashedPassword' }] }
    ;(pool.query as jest.Mock).mockResolvedValue(mockQueryResult)
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

    const response = await request(app).post('/login').send({
      email: 'test@example.com',
      password: 'password123',
    })

    expect(response.statusCode).toBe(200)
    expect(response.body.message).toBe('Login successful')
    expect(response.body.user).toEqual({ id: 123, username: 'testuser', email: 'test@example.com' })
    expect(response.body.token).toBe('mockedToken')
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = $1', ['test@example.com'])
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword')
    expect(jwt.sign).toHaveBeenCalledWith({ userId: 123 }, 'your-secret-key', { expiresIn: '1h' })
  })

  it('should handle login with invalid credentials', async () => {
    (pool.query as jest.Mock).mockResolvedValue({ rows: [] })

    const response = await request(app).post('/login').send({
      email: 'test@example.com',
      password: 'password123',
    })

    expect(response.statusCode).toBe(401)
    expect(response.body.message).toBe('Invalid credentials')
  })

  it('should handle login errors', async () => {
    (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'))

    const response = await request(app).post('/login').send({
      email: 'test@example.com',
      password: 'password123',
    })

    expect(response.statusCode).toBe(500)
    expect(response.body.message).toBe('Login failed')
    expect(response.body.error).toBe('Database error')
  })
})
