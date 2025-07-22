import { SetMetadata } from '@nestjs/common'
import { AuthType, AuthTypeType, ConditionGuard, ConditionGuardType } from '../constants/auth.constant'

export const AUTH_TYPES_KEY = 'authTypes'

export type AuthTypeDecoratorPayload = {
  authTypes: AuthTypeType[]
  option: {
    condition: ConditionGuardType
  }
}

export const Auth = (
  authTypes: AuthTypeType[],
  option: { condition: ConditionGuardType } = { condition: ConditionGuard.And },
) => {
  return SetMetadata(AUTH_TYPES_KEY, {
    authTypes,
    option,
  })
}

export const IsPublic = () => Auth([AuthType.None])
