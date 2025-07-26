import { Injectable } from '@nestjs/common'
import { CategoryTranslationRepository } from './category-translation.repo'
import { NotFoundRecordException } from 'src/shared/errror'
import { CreateCategoryTranslationBodyType, UpdateCategoryTranslationBodyType } from './category-translation.model'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { CategoryTranslationAlreadyExistsException } from './category-translation.error'

@Injectable()
export class CategoryTranslationService {
  constructor(private readonly categoryTranslationRepository: CategoryTranslationRepository) {}

  async findById(categoryTranslationId: number) {
    const categoryTranslation = await this.categoryTranslationRepository.findById(categoryTranslationId)
    if (!categoryTranslation) {
      throw NotFoundRecordException
    }
    return categoryTranslation
  }

  async create({ createdById, data }: { createdById: number; data: CreateCategoryTranslationBodyType }) {
    try {
      return await this.categoryTranslationRepository.create({
        createdById,
        data,
      })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw CategoryTranslationAlreadyExistsException
      }

      throw error
    }
  }

  async update({
    categoryTranslationId,
    updatedById,
    data,
  }: {
    categoryTranslationId: number
    updatedById: number
    data: UpdateCategoryTranslationBodyType
  }) {
    try {
      return await this.categoryTranslationRepository.update({
        categoryTranslationId,
        updatedById,
        data,
      })
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }

      if (isUniqueConstraintPrismaError(error)) {
        throw CategoryTranslationAlreadyExistsException
      }

      throw error
    }
  }

  async delete({ categoryTranslationId, deletedById }: { categoryTranslationId: number; deletedById: number }) {
    try {
      await this.categoryTranslationRepository.delete({ categoryTranslationId, deletedById })
      return {
        message: 'Message.CategoryTranslationDeleteSuccessfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
