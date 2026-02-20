import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { db } from '../db'

interface AuthenticatedRequest extends Request {
  userId?: number
}

const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Missing token' })
  }

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      console.error('JWT_SECRET is not defined')
      return res.status(500).json({ message: 'Server error' })
    }

    const decoded = jwt.verify(token, secret) as JwtPayload

    const userId = decoded.userId

    // Validate that the user exists in the database
    const user = await db.query('SELECT id FROM users WHERE id = $1', [userId])
    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Unauthorized: Invalid user' })
    }

    req.userId = userId
    next()
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res
        .status(401)
        .json({ message: 'Unauthorized: Token expired' })
    }
    console.error('Authentication error:', error)
    return res.status(403).json({ message: 'Unauthorized: Invalid token' })
  }
}

export default requireAuth
