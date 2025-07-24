import { Inject, Injectable } from '@nestjs/common'
import { RoleRepository } from './role.repo'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { NotFoundRecordException } from 'src/shared/errror'
import { RoleName } from 'src/shared/constants/role.constant'
import { ProhibitedActionOnBaseRoleException, RoleAlreadyExistsException } from './role.error'
import { PaginationQueryType } from 'src/shared/models/request.model'
import { CreateRoleBodyType, UpdateRoleBodyType } from './role.model'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async verifyRole(roleId: number) {
    const role = await this.roleRepository.findById(roleId)
    if (!role) {
      throw NotFoundRecordException
    }

    const baseRole: string[] = [RoleName.ADMIN, RoleName.CLIENT, RoleName.SELLER]

    if (baseRole.includes(role.name)) {
      throw ProhibitedActionOnBaseRoleException
    }
  }

  async list(pagination: PaginationQueryType) {
    return await this.roleRepository.list(pagination)
  }

  async findById(roleId: number) {
    const role = await this.roleRepository.findById(roleId)
    if (!role) {
      throw NotFoundRecordException
    }
    return role
  }

  async create({ data, createdById }: { data: CreateRoleBodyType; createdById: number }) {
    try {
      return await this.roleRepository.create({ data, createdById })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException
      }

      throw error
    }
  }

  async update({ roleId, data, updatedById }: { roleId: number; data: UpdateRoleBodyType; updatedById: number }) {
    try {
      await this.verifyRole(roleId)
      const updatedRole = await this.roleRepository.update({ roleId, data, updatedById })
      await this.cacheManager.del(`role:${updatedRole.id}`)
      return updatedRole
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ roleId, deletedById }: { roleId: number; deletedById: number }) {
    try {
      await this.verifyRole(roleId)
      await this.roleRepository.delete({ roleId, deletedById })
      await this.cacheManager.del(`role:${roleId}`)
      return {
        message: 'Message.DeleteRoleSuccessfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
