import { Inject, Injectable } from '@nestjs/common'
import { PermissionRepository } from './permission.repo'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { PaginationQueryType } from 'src/shared/models/request.model'
import { NotFoundRecordException } from 'src/shared/error'
import { CreatePermissionBodyType, UpdatePermissionBodyType } from './permission.model'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { PermissionAlreadyExistsException } from './permission.error'

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async deleteCachedRole(roles: { id: number }[]) {
    return Promise.all([
      roles.map((role) => {
        const cacheKey = `role:${role.id}`
        return this.cacheManager.del(cacheKey)
      }),
    ])
  }

  list(pagination: PaginationQueryType) {
    return this.permissionRepository.list(pagination)
  }

  async findById(permissionId: number) {
    const permission = await this.permissionRepository.findById(permissionId)
    if (!permission) {
      throw NotFoundRecordException
    }
    return permission
  }

  async create({ data, createdById }: { data: CreatePermissionBodyType; createdById: number }) {
    try {
      return await this.permissionRepository.create({ data, createdById })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException
      }
      throw error
    }
  }

  async update({
    permissionId,
    data,
    updatedById,
  }: {
    permissionId: number
    data: UpdatePermissionBodyType
    updatedById: number
  }) {
    try {
      const updatedPermission = await this.permissionRepository.update({
        permissionId,
        data,
        updatedById,
      })

      const { roles } = updatedPermission
      await this.deleteCachedRole(roles)

      return updatedPermission
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }

      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException
      }

      throw error
    }
  }

  async delete({ permissionId, deletedById }: { permissionId: number; deletedById: number }) {
    try {
      const deletedPermission = await this.permissionRepository.delete({ permissionId, deletedById })
      const { roles } = deletedPermission

      await this.deleteCachedRole(roles)

      return {
        message: 'Message.DeletePermissionSuccessfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }

      throw error
    }
  }
}
