import { Injectable } from '@nestjs/common'
import { PaginationQueryType } from 'src/shared/models/request.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreatePermissionBodyType,
  GetPermissionDetailResType,
  GetPermissionsResType,
  UpdatePermissionBodyType,
} from './permission.model'

@Injectable()
export class PermissionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(pagination: PaginationQueryType): Promise<GetPermissionsResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit

    const [totalItems, data] = await Promise.all([
      this.prismaService.permission.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.permission.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ])
    return {
      data,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit),
    }
  }

  findById(permissionId: number): Promise<GetPermissionDetailResType | null> {
    return this.prismaService.permission.findUnique({
      where: {
        id: permissionId,
        deletedAt: null,
      },
    })
  }

  create({
    createdById,
    data,
  }: {
    createdById: number
    data: CreatePermissionBodyType
  }): Promise<GetPermissionDetailResType> {
    return this.prismaService.permission.create({
      data: {
        ...data,
        createdById,
      },
    })
  }

  update({
    permissionId,
    updatedById,
    data,
  }: {
    permissionId: number
    updatedById: number
    data: UpdatePermissionBodyType
  }): Promise<GetPermissionDetailResType & { roles: { id: number }[] }> {
    return this.prismaService.permission.update({
      where: {
        id: permissionId,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById,
      },
      include: {
        roles: true,
      },
    })
  }

  delete(
    { permissionId, deletedById }: { permissionId: number; deletedById: number },
    isHard?: boolean,
  ): Promise<GetPermissionDetailResType & { roles: { id: number }[] }> {
    return isHard
      ? this.prismaService.permission.delete({
          where: {
            id: permissionId,
          },
          include: {
            roles: true,
          },
        })
      : this.prismaService.permission.update({
          where: {
            id: permissionId,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            deletedById,
          },
          include: {
            roles: true,
          },
        })
  }
}
