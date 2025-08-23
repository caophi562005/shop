import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { ALL_LANGUAGE_CODE } from '../constants/other.constant'
import { Prisma } from '@prisma/client'
import { GetProductDetailResType } from '../models/shared-product.model'

@Injectable()
export class SharedProductRepository {
  constructor(private readonly prismaService: PrismaService) {}

  getDetail({
    productId,
    languageId,
    isPublish,
  }: {
    productId: number
    languageId: string
    isPublish?: boolean
  }): Promise<GetProductDetailResType | null> {
    let where: Prisma.ProductWhereUniqueInput = {
      id: productId,
      deletedAt: null,
    }

    if (isPublish === true) {
      where.publishedAt = {
        lte: new Date(),
        not: null,
      }
    } else if (isPublish === false) {
      where = {
        ...where,
        OR: [{ publishedAt: null }, { publishedAt: { gt: new Date() } }],
      }
    }
    return this.prismaService.product.findUnique({
      where,
      include: {
        productTranslations: {
          where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { languageId: languageId, deletedAt: null },
        },
        skus: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            id: 'asc', // Order by creation order để giữ thứ tự logic combinations
          },
        },
        categories: {
          where: {
            deletedAt: null,
          },
          include: {
            categoryTranslations: {
              where:
                languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { languageId: languageId, deletedAt: null },
            },
          },
        },
      },
    })
  }
}
