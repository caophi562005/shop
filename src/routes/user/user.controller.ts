import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { UserService } from './user.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { CreateUserBodyDTO, CreateUserResDTO, GetUserParamsDTO, GetUsersResDTO, UpdateUserBodyDTO } from './user.dto'
import { PaginationQueryDTO } from 'src/shared/dtos/request.dto'
import { GetUserProfileResDTO, UpdateProfileResDTO } from 'src/shared/dtos/shared-user.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { AccessTokenPayload } from 'src/shared/types/jwt.type'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ZodSerializerDto(GetUsersResDTO)
  list(@Query() query: PaginationQueryDTO) {
    return this.userService.list(query)
  }

  @Get(':userId')
  @ZodSerializerDto(GetUserProfileResDTO)
  findById(@Param() params: GetUserParamsDTO) {
    return this.userService.findById(params.userId)
  }

  @Post()
  @ZodSerializerDto(CreateUserResDTO)
  create(@Body() body: CreateUserBodyDTO, @ActiveUser() user: AccessTokenPayload) {
    return this.userService.create({
      data: body,
      createdById: user.userId,
      createdByRoleName: user.roleName,
    })
  }

  @Put(':userId')
  @ZodSerializerDto(UpdateProfileResDTO)
  update(@Body() body: UpdateUserBodyDTO, @Param() params: GetUserParamsDTO, @ActiveUser() user: AccessTokenPayload) {
    return this.userService.update({
      data: body,
      userId: params.userId,
      updatedById: user.userId,
      updatedByRoleName: user.roleName,
    })
  }

  @Delete(':userId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetUserParamsDTO, @ActiveUser() user: AccessTokenPayload) {
    return this.userService.delete({
      userId: params.userId,
      deletedById: user.userId,
      deletedByRoleName: user.roleName,
    })
  }
}
