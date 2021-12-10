import { ServiceName, ServiceTokenType, ServiceUser } from './service'

export interface UserType {
  id: number
  username: string
  user_role: string
  email: string
  services?: ServiceUser[]
}

export type ContextTokens = {
  [key in ServiceTokenType]?: string
}

export interface AppContext extends ContextTokens {
  currentUser: UserJWT,
  accessToken: string,
  refreshToken: string
}

export interface UserRecord {
  id: number
  username: string
  user_role: string
  email: string
  password: string
  created_on: string
  last_login: string
}

export interface UserJWT {
  id: number
  username: string
}

export interface UserForCommit {
  usedService: ServiceName
  gitUsername: string
  email: string
  repositoryName: string
  repoLocation: string
}