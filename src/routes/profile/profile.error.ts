import { UnprocessableEntityException } from '@nestjs/common'

export const InvalidPasswordException = new UnprocessableEntityException([
  {
    message: 'Error.InvalidPassword',
    path: 'password',
  },
])
