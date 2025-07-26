import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateCategoryTranslationBodyType,
  GetCategoryTranslationDetailResType,
  UpdateCategoryTranslationBodyType,
} from './category-translation.model'
import { CategoryTranslationType } from 'src/shared/models/shared-category-translation.model'

@Injectable()
export class CategoryTranslationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findById(categoryTranslationId: number): Promise<GetCategoryTranslationDetailResType | null> {
    return this.prismaService.categoryTranslation.findUnique({
      where: {
        id: categoryTranslationId,
        deletedAt: null,
      },
    })
  }

  create({
    createdById,
    data,
  }: {
    createdById: number
    data: CreateCategoryTranslationBodyType
  }): Promise<GetCategoryTranslationDetailResType> {
    return this.prismaService.categoryTranslation.create({
      data: {
        ...data,
        createdById,
      },
    })
  }

  update({
    categoryTranslationId,
    updatedById,
    data,
  }: {
    categoryTranslationId: number
    updatedById: number
    data: UpdateCategoryTranslationBodyType
  }): Promise<GetCategoryTranslationDetailResType> {
    return this.prismaService.categoryTranslation.update({
      where: {
        id: categoryTranslationId,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById,
      },
    })
  }

  delete(
    { categoryTranslationId, deletedById }: { categoryTranslationId: number; deletedById: number },
    isHard?: boolean,
  ): Promise<CategoryTranslationType> {
    return isHard
      ? this.prismaService.categoryTranslation.delete({
          where: {
            id: categoryTranslationId,
          },
        })
      : this.prismaService.categoryTranslation.update({
          where: {
            id: categoryTranslationId,
            deletedAt: null,
          },
          data: {
            deletedById,
            deletedAt: new Date(),
          },
        })
  }
}
