import { Injectable } from '@nestjs/common'
import { ProductTranslationRepository } from './product-translation.repo'
import { NotFoundRecordException } from 'src/shared/error'
import { CreateProductTranslationBodyType, UpdateProductTranslationBodyType } from './product-translation.model'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { ProductTranslationAlreadyExistsException } from './product-translation.error'

@Injectable()
export class ProductTranslationService {
  constructor(private readonly productTranslationRepository: ProductTranslationRepository) {}

  async findById(id: number) {
    const product = await this.productTranslationRepository.findById(id)
    if (!product) {
      throw NotFoundRecordException
    }
    return product
  }

  async create({ data, createdById }: { data: CreateProductTranslationBodyType; createdById: number }) {
    try {
      return await this.productTranslationRepository.create({
        data,
        createdById,
      })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw ProductTranslationAlreadyExistsException
      }
      throw error
    }
  }

  async update({
    productTranslationId,
    data,
    updatedById,
  }: {
    productTranslationId: number
    data: UpdateProductTranslationBodyType
    updatedById: number
  }) {
    try {
      return await this.productTranslationRepository.update({
        productTranslationId,
        data,
        updatedById,
      })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw ProductTranslationAlreadyExistsException
      }
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async delete({ productTranslationId, deletedById }: { productTranslationId: number; deletedById: number }) {
    try {
      await this.productTranslationRepository.delete({
        productTranslationId,
        deletedById,
      })
      return {
        message: 'Message.DeleteProductTranslationSuccessFully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
