import { Request, Response, NextFunction } from 'express'

export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.url} - User: ${req.user ? req.user.id : 'Guest'}`)
  next()
}
