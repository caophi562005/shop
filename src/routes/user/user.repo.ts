import { Injectable } from '@nestjs/common'
import { PaginationQueryType } from 'src/shared/models/request.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreateUserBodyType, GetUsersResType } from './user.model'
import { UserType } from 'src/shared/models/shared-user.model'

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(pagination: PaginationQueryType): Promise<GetUsersResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit

    const [totalItems, data] = await Promise.all([
      this.prismaService.user.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.user.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take,
        include: {
          role: true,
        },
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

  create({ createdById, data }: { createdById: number | null; data: CreateUserBodyType }): Promise<UserType> {
    return this.prismaService.user.create({
      data: {
        ...data,
        createdById,
      },
    })
  }

  delete({ userId, deletedById }: { userId: number; deletedById: number }, isHard?: boolean): Promise<UserType> {
    return isHard
      ? this.prismaService.user.delete({
          where: {
            id: userId,
          },
        })
      : this.prismaService.user.update({
          where: {
            id: userId,
            deletedAt: null,
          },
          data: {
            deletedById,
            deletedAt: new Date(),
          },
        })
  }
}
