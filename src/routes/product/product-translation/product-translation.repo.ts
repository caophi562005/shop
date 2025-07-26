import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateProductTranslationBodyType,
  GetProductTranslationDetailResType,
  UpdateProductTranslationBodyType,
} from './product-translation.model'

@Injectable()
export class ProductTranslationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findById(id: number): Promise<GetProductTranslationDetailResType | null> {
    return this.prismaService.productTranslation.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })
  }

  create({
    createdById,
    data,
  }: {
    createdById: number
    data: CreateProductTranslationBodyType
  }): Promise<GetProductTranslationDetailResType> {
    return this.prismaService.productTranslation.create({
      data: {
        ...data,
        createdById,
      },
    })
  }

  async update({
    productTranslationId,
    updatedById,
    data,
  }: {
    productTranslationId: number
    updatedById: number
    data: UpdateProductTranslationBodyType
  }): Promise<GetProductTranslationDetailResType> {
    return this.prismaService.productTranslation.update({
      where: {
        id: productTranslationId,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById,
      },
    })
  }

  delete(
    { productTranslationId, deletedById }: { productTranslationId: number; deletedById: number },
    isHard?: boolean,
  ): Promise<GetProductTranslationDetailResType> {
    return isHard
      ? this.prismaService.productTranslation.delete({
          where: {
            id: productTranslationId,
          },
        })
      : this.prismaService.productTranslation.update({
          where: {
            id: productTranslationId,
            deletedAt: null,
          },
          data: {
            deletedById,
            deletedAt: new Date(),
          },
        })
  }
}
