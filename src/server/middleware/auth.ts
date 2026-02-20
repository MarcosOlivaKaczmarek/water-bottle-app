import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import config from 'config'

const jwtSecret = config.get<string>('auth.jwtSecret')

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' })
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { user: { id: number } }
    (req as any).user = decoded.user // Attach user to the request
    next()
  } catch (e: any) {
    console.error('auth middleware error', e.message)
    res.status(400).json({ message: 'Token is not valid' })
  }
}
