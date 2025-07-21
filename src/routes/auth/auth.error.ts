import { UnprocessableEntityException } from '@nestjs/common'

export const InvalidOTPException = new UnprocessableEntityException([
  {
    message: 'Error.InvalidOTP',
    path: 'code',
  },
])

export const OTPExpiredException = new UnprocessableEntityException([
  {
    message: 'Error.OTPExpired',
    path: 'code',
  },
])

export const FailedToSendOTPException = new UnprocessableEntityException([
  {
    message: 'Error.FailedToSendOTP',
    path: 'code',
  },
])

export const EmailAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.EmailAlreadyExists',
    path: 'email',
  },
])

export const EmailNotFoundException = new UnprocessableEntityException([
  {
    message: 'Error.EmailNotFound',
    path: 'email',
  },
])

export const RefreshTokenAlreadyUsedException = new UnprocessableEntityException([
  {
    message: 'Error.RefreshTokenAlreadyUsed',
    path: 'refreshToken',
  },
])

export const UnauthorizedAccessException = new UnprocessableEntityException([
  {
    message: 'Error.UnauthorizedAccess',
    path: 'refreshToken',
  },
])

export const InvalidPasswordException = new UnprocessableEntityException([
  {
    message: 'Error.InvalidPassword',
    path: 'password',
  },
])
