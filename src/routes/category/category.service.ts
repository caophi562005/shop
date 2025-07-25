import { Injectable } from '@nestjs/common'
import { CategoryRepository } from './category.repo'
import { CreateCategoryBodyType, GetCategoriesQueryType } from './category.model'
import { I18nContext } from 'nestjs-i18n'
import { NotFoundRecordException } from 'src/shared/errror'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { CategoryAlreadyExistsException } from './category.error'

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  findAll(query: GetCategoriesQueryType) {
    return this.categoryRepository.findAll({
      query,
      languageId: I18nContext.current()?.lang as string,
    })
  }

  async findById(categoryId: number) {
    const category = await this.categoryRepository.findById({
      categoryId,
      languageId: I18nContext.current()?.lang as string,
    })
    if (!category) {
      throw NotFoundRecordException
    }
    return category
  }

  async create({ data, createdById }: { data: CreateCategoryBodyType; createdById: number }) {
    try {
      return await this.categoryRepository.create({
        data,
        createdById,
      })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw CategoryAlreadyExistsException
      }

      throw error
    }
  }

  async update({
    categoryId,
    data,
    updatedById,
  }: {
    categoryId: number
    data: CreateCategoryBodyType
    updatedById: number
  }) {
    try {
      return await this.categoryRepository.update({
        categoryId,
        data,
        updatedById,
      })
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }

      if (isUniqueConstraintPrismaError(error)) {
        throw CategoryAlreadyExistsException
      }

      throw error
    }
  }

  async delete({ categoryId, deletedById }: { categoryId: number; deletedById: number }) {
    try {
      await this.categoryRepository.delete({
        categoryId,
        deletedById,
      })

      return {
        message: 'Message.DeleteCategorySuccess',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }

      throw error
    }
  }
}
