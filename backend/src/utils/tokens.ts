import { sign } from 'jsonwebtoken'
import { Tokens } from '../types/tokens'
import { UserJWT } from '../types/user'
import { UserType } from '../types/user'
import config from './config'

export const createTokens = (user: UserType | UserJWT | null): Tokens => {
  const accessToken = sign(
    {
      id: user?.id,
      username: user?.username,
      role: user?.user_role
    },
    config.JWT_SECRET,
    { expiresIn: '15 min' }
  )

  const refreshToken = sign(
    {
      id: user?.id,
      username: user?.username,
      role: user?.user_role
    },
    config.JWT_SECRET,
    { expiresIn: '7 days' }
  )
  return { accessToken, refreshToken }
}
