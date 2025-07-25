import { UnauthorizedException } from '@nestjs/common'

export const CategoryAlreadyExistsException = new UnauthorizedException([
  {
    message: 'Error.CategoryAlreadyExists',
    path: 'name',
  },
])
