import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { db } from '../db'

// Define the type for the user object in the request
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string }
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) {
    return res.sendStatus(401) // No token, unauthorized
  }

  jwt.verify(token, process.env.JWT_SECRET as string, async (err: any, user: any) => {
    if (err) {
      return res.sendStatus(403) // Invalid token, forbidden
    }

    try {
      // Verify that the user still exists in the database
      const result = await db.query('SELECT id, email FROM users WHERE id = $1', [user.id])

      if (result.rows.length === 0) {
        return res.sendStatus(401) // User not found, unauthorized
      }

      // Attach the user object to the request
      req.user = { id: result.rows[0].id, email: result.rows[0].email }
      next()
    } catch (error) {
      console.error('Error verifying user:', error)
      return res.sendStatus(500) // Internal server error
    }
  })
}
