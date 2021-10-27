import { AccessTokenResponse, ContextTokens } from './../types/user'
import { ServiceTokenType, ServiceName } from './../types/service'
import { verify } from 'jsonwebtoken'
import config from '../utils/config'
import { formatData, hasExpired } from '../utils/tokens'
import { UserJWT } from '../types/user'
import { refreshGitLabToken } from './gitLab'
import { refreshBitbucketToken } from './bitbucket'

type TokenMap = Map<ServiceName, AccessTokenResponse>

const tokenStorage = new Map<number, TokenMap>()

const setToken = (
  userId: number,
  service: ServiceName,
  data: AccessTokenResponse
): void => {
  const tokenMap: TokenMap =
    tokenStorage.get(userId) ?? new Map<ServiceName, AccessTokenResponse>()

  tokenMap.set(service, formatData(data))
  tokenStorage.set(userId, tokenMap)
}

const getTokenMap = (amandusToken: string): TokenMap | null => {
  // if refactored as an idependent service, this version should be used.
  // for now it is ok to allow fetching with user id
  const decodedToken = <UserJWT>verify(amandusToken, config.JWT_SECRET)

  return tokenStorage.get(decodedToken.id) ?? null
}

const getTokensForApolloContext = (amandusToken: string): ContextTokens => {
  const tokenMap = getTokenMap(amandusToken)

  const contextTokens: ContextTokens = {}

  if (tokenMap) {
    for (const [service, data] of tokenMap) {
      contextTokens[`${service}Token` as ServiceTokenType] = data.access_token
    }
  }

  return contextTokens
}

const getTokenMapById = (userId: number): TokenMap | null => {
  // this should NOT be used, if refactored as an independent service
  return tokenStorage.get(userId) ?? null
}

const getServiceDetails = (
  userId: number,
  service: ServiceName
): AccessTokenResponse | null => {
  const tokenMap = getTokenMapById(userId)

  if (tokenMap) {
    const serviceData = tokenMap.get(service)

    return serviceData ?? null
  }

  return null
}

const isServiceConnected = (userId: number, service: ServiceName): boolean => {
  return getServiceDetails(userId, service) ? true : false
}

const getAccessTokenByServiceAndId = async (
  userId: number,
  service: ServiceName
): Promise<string | null> => {
  const data = getServiceDetails(userId, service)

  if (data) {
    if (hasExpired(data)) {
      const newData = await refreshToken(service, data.refresh_token)

      setToken(userId, service, newData)
      return newData.access_token
    }

    return data.access_token
  }

  return null
}

const deleteTokenByUserId = (userId: number): void => {
  // this should probably not be used, if refactored as an independent service
  tokenStorage.delete(userId)
}

const getTokensForApolloContextById = (userId: number): ContextTokens => {
  // this should NOT be used, if refactored as an independent service
  const tokenMap = getTokenMapById(userId)

  const contextTokens: ContextTokens = {}

  if (tokenMap) {
    for (const [service, data] of tokenMap) {
      if (hasExpired(data)) {
        // this will result in multiple refresh fetches on same token
        // because function is called multiple times on pageload and
        // previous promise(s) is still pending
        const newData = await refreshToken(service, data.refresh_token)

        contextTokens[`${service}Token` as ServiceTokenType] =
          newData.access_token

        tokenMap.set(service, newData)
      } else {
        contextTokens[`${service}Token` as ServiceTokenType] = data.access_token
      }
    }
  }

  return contextTokens
}

const refreshToken = async (
  service: ServiceName,
  refreshToken: string
): Promise<AccessTokenResponse> => {
  let details: AccessTokenResponse = {}

  switch (service) {
    case 'gitlab':
      details = await refreshGitLabToken(refreshToken)
      break
    case 'bitbucket':
      details = await refreshBitbucketToken(refreshToken)
      break
    default:
  }

  return details
}

const clearStorage = (): void => {
  tokenStorage.clear()
}

export default {
  setToken,
  getTokenMap,
  getTokenMapById,
  getTokensForApolloContext,
  getTokensForApolloContextById,
  getAccessTokenByServiceAndId,
  isServiceConnected,
  clearStorage,
  deleteTokenByUserId,
}
