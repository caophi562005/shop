import { Injectable } from '@nestjs/common'
import { PaginationQueryType } from 'src/shared/models/request.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateRoleBodyType,
  CreateRoleResType,
  GetRoleDetailResType,
  GetRolesResType,
  UpdateRoleBodyType,
  UpdateRoleResType,
} from './role.model'
import { RoleType } from 'src/shared/models/shared-role.model'
import { Prisma } from '@prisma/client'

@Injectable()
export class RoleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(pagination: PaginationQueryType): Promise<GetRolesResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.role.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.role.findMany({
        where: {
          deletedAt: null,
        },
        take,
        skip,
      }),
    ])
    return {
      data,
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.limit),
    }
  }

  async findById(roleId: number): Promise<GetRoleDetailResType | null> {
    return this.prismaService.role.findUnique({
      where: {
        id: roleId,
        deletedAt: null,
      },
      include: {
        permissions: {
          where: {
            deletedAt: null,
          },
        },
      },
    })
  }

  create({ createdById, data }: { createdById: number; data: CreateRoleBodyType }): Promise<CreateRoleResType> {
    return this.prismaService.role.create({
      data: {
        ...data,
        createdById,
      },
    })
  }

  async update({
    roleId,
    updatedById,
    data,
  }: {
    roleId: number
    updatedById: number
    data: UpdateRoleBodyType
  }): Promise<UpdateRoleResType> {
    // Kiểm tra nếu có permission nào đã xoá mềm thì không cho cập nhập
    if (data.permissions && data.permissions.length > 0) {
      const permissions = await this.prismaService.permission.findMany({
        where: {
          id: {
            in: data.permissions,
          },
        },
      })

      const deletedPermission = permissions.filter((permission) => permission.deletedAt)
      if (deletedPermission.length > 0) {
        const deletedIds = deletedPermission.map((permission) => permission.id).join(', ')
        throw new Error(`Permission with ids have been deleted : ${deletedIds}`)
      }
    }

    const updateData: Prisma.XOR<Prisma.RoleUpdateInput, Prisma.RoleUncheckedUpdateInput> = {
      name: data.name,
      description: data.description,
      isActive: data.isActive,
      updatedById,
    }
    if (data.permissions) {
      updateData.permissions = {
        set: data.permissions.map((id) => ({ id })),
      }
    }

    return this.prismaService.role.update({
      where: {
        id: roleId,
        deletedAt: null,
      },
      data: updateData,
    })
  }

  delete({ roleId, deletedById }: { roleId: number; deletedById: number }, isHard?: boolean): Promise<RoleType> {
    return isHard
      ? this.prismaService.role.delete({
          where: {
            id: roleId,
          },
        })
      : this.prismaService.role.update({
          where: {
            id: roleId,
            deletedAt: null,
          },
          data: {
            deletedById,
            deletedAt: new Date(),
          },
        })
  }
}
