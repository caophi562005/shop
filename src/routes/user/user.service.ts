import { ForbiddenException, Injectable } from '@nestjs/common'
import { UserRepository } from './user.repo'
import { HashingService } from 'src/shared/services/hashing.service'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { RoleName } from 'src/shared/constants/role.constant'
import { NotFoundRecordException } from 'src/shared/error'
import { PaginationQueryType } from 'src/shared/models/request.model'
import { CreateUserBodyType, UpdateUserBodyType } from './user.model'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError,
} from 'src/shared/helpers'
import { CannotUpdateOrDeleteYourselfException, RoleNotFoundException, UserAlreadyExistsException } from './user.error'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly sharedRoleRepository: SharedRoleRepository,
  ) {}

  private async verifyRole({ roleNameAgent, roleIdTarget }) {
    if (roleNameAgent === RoleName.ADMIN) {
      return true
    } else {
      const adminRoleId = await this.sharedRoleRepository.getAdminRoleId()
      if (roleIdTarget === adminRoleId) {
        throw new ForbiddenException()
      }
      return true
    }
  }

  private verifyYourself({ userAgentId, userTargetId }: { userAgentId: number; userTargetId: number }) {
    if (userAgentId === userTargetId) {
      throw CannotUpdateOrDeleteYourselfException
    }
  }

  private async getRoleIdByUserId(userId: number) {
    const user = await this.sharedUserRepository.findUnique({
      id: userId,
    })

    if (!user) {
      throw NotFoundRecordException
    }

    return user.roleId
  }

  list(pagination: PaginationQueryType) {
    return this.userRepository.list(pagination)
  }

  async findById(userId: number) {
    const user = await this.sharedUserRepository.findUniqueIncludeRolePermission({
      id: userId,
    })

    if (!user) {
      throw NotFoundRecordException
    }

    return user
  }

  async create({
    data,
    createdById,
    createdByRoleName,
  }: {
    data: CreateUserBodyType
    createdById: number | null
    createdByRoleName: string
  }) {
    try {
      // Kiểm tra role cho user mới có hợp lệ không
      await this.verifyRole({
        roleNameAgent: createdByRoleName,
        roleIdTarget: data.roleId,
      })

      // hash password
      const hashedPassword = await this.hashingService.hash(data.password)

      const user = await this.userRepository.create({
        createdById,
        data: {
          ...data,
          password: hashedPassword,
        },
      })

      return user
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw RoleNotFoundException
      }

      if (isUniqueConstraintPrismaError(error)) {
        throw UserAlreadyExistsException
      }

      throw error
    }
  }

  async update({
    userId,
    data,
    updatedById,
    updatedByRoleName,
  }: {
    userId: number
    data: UpdateUserBodyType
    updatedById: number
    updatedByRoleName: string
  }) {
    try {
      //không thể cập nhập chính mình
      await this.verifyYourself({
        userAgentId: updatedById,
        userTargetId: userId,
      })

      // Kiểm tra role muốn cập nhập lên hợp lệ không
      const roleIdTarget = await this.getRoleIdByUserId(userId)
      await this.verifyRole({
        roleIdTarget,
        roleNameAgent: updatedByRoleName,
      })

      const hashedPassword = await this.hashingService.hash(data.password)

      const updateUser = await this.sharedUserRepository.update(
        { id: userId },
        { ...data, password: hashedPassword, updatedById },
      )

      return updateUser
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }

      if (isUniqueConstraintPrismaError(error)) {
        throw UserAlreadyExistsException
      }

      if (isForeignKeyConstraintPrismaError(error)) {
        throw RoleNotFoundException
      }
      throw error
    }
  }

  async delete({
    userId,
    deletedById,
    deletedByRoleName,
  }: {
    userId: number
    deletedById: number
    deletedByRoleName: string
  }) {
    try {
      //Không thể xoá chính mình
      await this.verifyYourself({
        userAgentId: deletedById,
        userTargetId: userId,
      })

      const roleIdTarget = await this.getRoleIdByUserId(userId)
      await this.verifyRole({
        roleNameAgent: deletedByRoleName,
        roleIdTarget,
      })

      await this.userRepository.delete({
        userId,
        deletedById,
      })

      return {
        message: 'Message.DeleteUserSuccessfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }

      throw error
    }
  }
}
