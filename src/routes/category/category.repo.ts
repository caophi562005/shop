import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateCategoryBodyType,
  GetCategoriesQueryType,
  GetCategoriesResType,
  GetCategoryDetailResType,
  UpdateCategoryBodyType,
} from './category.model'
import { ALL_LANGUAGE_CODE } from 'src/shared/constants/other.constant'
import { CategoryType } from 'src/shared/models/shared-category.model'

@Injectable()
export class CategoryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll({
    query,
    languageId,
  }: {
    query: GetCategoriesQueryType
    languageId: string
  }): Promise<GetCategoriesResType> {
    const data = await this.prismaService.category.findMany({
      where: {
        parentCategoryId: query.parentCategoryId ?? null,
        deletedAt: null,
      },
      include: {
        categoryTranslations: {
          where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      data,
    }
  }

  findById({
    categoryId,
    languageId,
  }: {
    categoryId: number
    languageId: string
  }): Promise<GetCategoryDetailResType | null> {
    return this.prismaService.category.findUnique({
      where: {
        id: categoryId,
        deletedAt: null,
      },
      include: {
        categoryTranslations: {
          where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
        },
      },
    })
  }

  findByParentId({
    categoryId,
    languageId,
  }: {
    categoryId: number
    languageId: string
  }): Promise<GetCategoryDetailResType | null> {
    return this.prismaService.category.findUnique({
      where: {
        id: categoryId,
        deletedAt: null,
      },
      include: {
        categoryTranslations: {
          where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
        },
      },
    })
  }

  create({
    createdById,
    data,
  }: {
    createdById: number
    data: CreateCategoryBodyType
  }): Promise<GetCategoryDetailResType> {
    return this.prismaService.category.create({
      data: {
        ...data,
        createdById,
      },
      include: {
        categoryTranslations: {
          where: {
            deletedAt: null,
          },
        },
      },
    })
  }

  update({
    updatedById,
    categoryId,
    data,
  }: {
    updatedById: number
    categoryId: number
    data: UpdateCategoryBodyType
  }): Promise<GetCategoryDetailResType> {
    return this.prismaService.category.update({
      where: {
        id: categoryId,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById,
      },
      include: {
        categoryTranslations: {
          where: {
            deletedAt: null,
          },
        },
      },
    })
  }

  delete(
    { deletedById, categoryId }: { deletedById: number; categoryId: number },
    isHard?: boolean,
  ): Promise<CategoryType> {
    return isHard
      ? this.prismaService.category.delete({
          where: {
            id: categoryId,
          },
        })
      : this.prismaService.category.update({
          where: {
            id: categoryId,
            deletedAt: null,
          },
          data: {
            deletedById,
            deletedAt: new Date(),
          },
        })
  }
}
