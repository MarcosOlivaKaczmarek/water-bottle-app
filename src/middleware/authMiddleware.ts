import { expressjwt } from 'express-jwt'
import config from 'config'
import { Request, Response, NextFunction } from 'express'
import { logger } from '../logger'

const jwtSecret = config.get<string>('auth.jwtSecret')

export const checkJwt = expressjwt({
  secret: jwtSecret,
  algorithms: ['HS256'],
  credentialsRequired: true,
  getToken: function fromHeaderOrQuerystring(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1]
    } else if (req.query && req.query.token) {
      return req.query.token as string
    }
    return null
  },
})

// Middleware to extend the Express Request interface
interface CustomRequest extends Request {
  user?: { id: number }
}

// Error handling for JWT authentication
export const jwtErrorHandler = (err: any, req: CustomRequest, res: Response, next: NextFunction) => {
  if (err.name === 'UnauthorizedError') {\n    logger.error(`Unauthorized access: ${err.message}`)
    return res.status(401).json({ error: 'Unauthorized: Invalid token' })
  }
  next(err)
}
