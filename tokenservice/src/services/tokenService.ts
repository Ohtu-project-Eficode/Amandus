import { verify } from 'jsonwebtoken'
import { hasExpired, refreshToken, formatData } from '../utils/token'
import config from '../utils/config'

import {
  UserJWT,
  ServiceName,
  AccessTokenResponse,
  TokenMap
} from '../types'

const tokenStorage = new Map<number, TokenMap>()

const setToken = (
  amandusToken: string,
  service: ServiceName,
  token: AccessTokenResponse,
  id: number
): void => {
  const decodedToken = <UserJWT>verify(amandusToken, config.JWT_SECRET)
  if (id !== decodedToken.id) throw new Error('token and id mismatch')

  try {
    const tokenMap: TokenMap =
      tokenStorage.get(decodedToken.id) ?? new Map<ServiceName, AccessTokenResponse>()

    tokenMap.set(service, formatData(token))
    tokenStorage.set(decodedToken.id, tokenMap)

  } catch (e) {
    throw new Error(`failed to save new token: ${(e as Error).message}`)
  }

}

const getAccessToken = async (
  amandusToken: string,
  service: ServiceName,
  id: number
): Promise<string | null> => {
  const data = getServiceDetails(amandusToken, service, id)

  if (data) {

    if (hasExpired(data) && data.refresh_token) {
      try {
        const newData = await refreshToken(service, data.refresh_token)
        setToken(amandusToken, service, newData, id)

        return newData.access_token
      } catch (e) {
        console.log(e)
        removeToken(amandusToken, service, id)

        return null
      }
    }

    return data.access_token
  }

  return null
}

const removeToken = (
  amandusToken: string,
  service: ServiceName,
  id: number
): string => {
  const tokenMap = getTokenMap(amandusToken, id)

  if(!tokenMap?.has(service)){
    return 'service token does not exist'
  }

  tokenMap?.delete(service)

  return 'service token has been removed'
}

const removeUser = (
  amandusToken: string,
  id: number
): string => {
  const decodedToken = <UserJWT>verify(amandusToken, config.JWT_SECRET)
  
  if (decodedToken.role === 'admin'){
    tokenStorage.delete(id)
    return `admin has removed user ${id}`
  }

  if (id !== decodedToken.id) {
    throw new Error('token and id mismatch')
  }

  if (!tokenStorage.has(decodedToken.id)) {
    return 'user not found from token service'
  }

  tokenStorage.delete(decodedToken.id)

  return 'user data removed from token service'
}

const getServiceDetails = (
  amandusToken: string,
  service: ServiceName,
  id: number
): AccessTokenResponse | null => {
  const tokenMap = getTokenMap(amandusToken, id)

  if (tokenMap) {
    const serviceData = tokenMap.get(service)
    return serviceData ?? null
  }

  return null
}

const isServiceConnected = (
  id: number,
  service: ServiceName,
  amandusToken: string,
): boolean => {
  return getServiceDetails(amandusToken, service, id) ? true : false
}

const getTokenMap = (
  amandusToken: string,
  id: number
): TokenMap | null => {
  const decodedToken = <UserJWT>verify(amandusToken, config.JWT_SECRET)
  if (id !== decodedToken.id) {
    throw new Error('token and id mismatch')
  }

  return tokenStorage.get(decodedToken.id) ?? null
}

const clearStorage = (): void => {
  tokenStorage.clear()
}

export default {
  setToken,
  getAccessToken,
  removeToken,
  removeUser,
  clearStorage,
  getTokenMap,
  getServiceDetails,
  isServiceConnected
}
