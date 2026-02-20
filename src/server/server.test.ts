import request from 'supertest'
import express from 'express'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'

import app from './server'

// Mock the database pool
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    end: jest.fn(),
  }
  return {
    Pool: jest.fn(() => mPool),
  }
})

const mockedPool = new Pool() as jest.Mocked<Pool>

// Mock JWT_SECRET
process.env.JWT_SECRET = 'your-secret-key'

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /register', () => {
    it('should register a new user', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10)
      mockedPool.query.mockResolvedValueOnce({ rows: [{ id: 1, username: 'testuser', email: 'test@example.com' }] })

      const response = await request(app)
        .post('/register')
        .send({ username: 'testuser', email: 'test@example.com', password: 'password123' })

      expect(response.statusCode).toBe(201)
      expect(response.body.message).toBe('User registered successfully')
      expect(response.body.user).toEqual({ id: 1, username: 'testuser', email: 'test@example.com' })
      expect(mockedPool.query).toHaveBeenCalledWith(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
        ['testuser', 'test@example.com', expect.any(String)],
      )
    })

    it('should return 400 if username is too short', async () => {
      const response = await request(app)
        .post('/register')
        .send({ username: 'te', email: 'test@example.com', password: 'password123' })

      expect(response.statusCode).toBe(400)
      expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ msg: 'Username must be at least 3 characters long' })]))
    })

    it('should return 400 if email is invalid', async () => {
      const response = await request(app)
        .post('/register')
        .send({ username: 'testuser', email: 'invalid-email', password: 'password123' })

      expect(response.statusCode).toBe(400)
      expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ msg: 'Invalid email address' })]))
    })

    it('should return 400 if password is too short', async () => {
      const response = await request(app)
        .post('/register')
        .send({ username: 'testuser', email: 'test@example.com', password: 'pass' })

      expect(response.statusCode).toBe(400)
      expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ msg: 'Password must be at least 6 characters long' })]))
    })

    it('should return 400 if username or email already exists', async () => {
      mockedPool.query.mockRejectedValueOnce({ code: '23505' })

      const response = await request(app)
        .post('/register')
        .send({ username: 'testuser', email: 'test@example.com', password: 'password123' })

      expect(response.statusCode).toBe(400)
      expect(response.body.error).toBe('Username or email already exists')
    })

    it('should return 500 for other database errors', async () => {
      mockedPool.query.mockRejectedValueOnce(new Error('Database error'))

      const response = await request(app)
        .post('/register')
        .send({ username: 'testuser', email: 'test@example.com', password: 'password123' })

      expect(response.statusCode).toBe(500)
      expect(response.body.error).toBe('Failed to register user')
    })
  })

  describe('POST /login', () => {
    it('should login an existing user', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10)
      mockedPool.query.mockResolvedValueOnce({ rows: [{ id: 1, username: 'testuser', email: 'test@example.com', password: hashedPassword }] })

      const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'password123' })

      expect(response.statusCode).toBe(200)
      expect(response.body.message).toBe('Logged in successfully')
      expect(response.body.user).toEqual({ id: 1, username: 'testuser', email: 'test@example.com' })
      expect(mockedPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = $1', ['test@example.com'])
    })

    it('should return 401 for invalid credentials', async () => {
      mockedPool.query.mockResolvedValueOnce({ rows: [] })

      const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'password123' })

      expect(response.statusCode).toBe(401)
      expect(response.body.error).toBe('Invalid credentials')
    })

    it('should return 401 for incorrect password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10)
      mockedPool.query.mockResolvedValueOnce({ rows: [{ id: 1, username: 'testuser', email: 'test@example.com', password: hashedPassword }] })

      const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' })

      expect(response.statusCode).toBe(401)
      expect(response.body.error).toBe('Invalid credentials')
    })

    it('should return 400 if email is invalid', async () => {
      const response = await request(app)
        .post('/login')
        .send({ email: 'invalid-email', password: 'password123' })

      expect(response.statusCode).toBe(400)
      expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ msg: 'Invalid email address' })]))
    })

    it('should return 400 if password is too short', async () => {
      const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'pass' })

      expect(response.statusCode).toBe(400)
      expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ msg: 'Password must be at least 6 characters long' })]))
    })

    it('should return 500 for database errors', async () => {
      mockedPool.query.mockRejectedValueOnce(new Error('Database error'))

      const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'password123' })

      expect(response.statusCode).toBe(500)
      expect(response.body.error).toBe('Failed to login')
    })
  })
})
