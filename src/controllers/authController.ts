import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { createUser, findUserByUsername } from '../services/userService'
import dotenv from 'dotenv'

dotenv.config()

const jwtSecret = process.env.JWT_SECRET
const saltRounds = 10

if (!jwtSecret) {
  throw new Error('JWT_SECRET is not defined in the environment variables.')
}

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body

    // Check if the username already exists
    const existingUser = await findUserByUsername(username)
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create the user
    const newUser = await createUser({ username, email, password: hashedPassword })

    res.status(201).json({ message: 'User registered successfully', user: newUser })
  } catch (error) {
    console.error('Error registering user:', error)
    res.status(500).json({ message: 'Failed to register user' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    // Find the user by username
    const user = await findUserByUsername(username)
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Compare the password
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Create a JWT token
    const token = jwt.sign({ sub: user.id, username: user.username }, jwtSecret, { expiresIn: '1d' })

    res.status(200).json({ message: 'Logged in successfully', token: token })
  } catch (error) {
    console.error('Error logging in:', error)
    res.status(500).json({ message: 'Failed to login' })
  }
}
