import { ForbiddenException, UnauthorizedException } from '@nestjs/common'

export const UserAlreadyExistsException = new UnauthorizedException([
  {
    message: 'Error.UserAlreadyExists',
    path: 'email',
  },
])

export const RoleNotFoundException = new UnauthorizedException([
  {
    message: 'Error.RoleNotFound',
    path: 'roleId',
  },
])

export const CannotUpdateOrDeleteYourselfException = new ForbiddenException([
  {
    message: 'Error.CannotUpdateOrDeleteYourself',
    path: 'userId',
  },
])
