import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { PassportStatic } from 'passport'
import { findUserById } from '../services/userService'
import dotenv from 'dotenv'

dotenv.config()

const jwtSecret = process.env.JWT_SECRET

if (!jwtSecret) {
  throw new Error('JWT_SECRET is not defined in the environment variables.')
}

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
}

export const configurePassport = (passport: PassportStatic) => {
  passport.use(
    new JwtStrategy(
      options,
      async (jwtPayload, done) => {
        try {
          const user = await findUserById(jwtPayload.sub)

          if (user) {
            return done(null, user)
          } else {
            return done(null, false)
          }
        } catch (error) {
          return done(error, false)
        }
      },
    ),
  )
}
