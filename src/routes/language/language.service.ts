import { Injectable } from '@nestjs/common'
import { LanguageRepository } from './language.repo'
import { NotFoundRecordException } from 'src/shared/errror'
import { CreateLanguageBodyType, UpdateLanguageBodyType } from './language.model'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { LanguageAlreadyExistsException } from './language.error'

@Injectable()
export class LanguageService {
  constructor(private readonly languageRepository: LanguageRepository) {}

  async findAll() {
    const data = await this.languageRepository.findAll()
    return {
      data,
      totalItems: data.length,
    }
  }

  async findById(languageId: string) {
    const language = await this.languageRepository.findById(languageId)
    if (!language) {
      throw NotFoundRecordException
    }
    return language
  }

  async create({ data, createdById }: { data: CreateLanguageBodyType; createdById: number }) {
    try {
      return await this.languageRepository.create({ data, createdById })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw LanguageAlreadyExistsException
      }
      throw error
    }
  }

  async update({
    languageId,
    data,
    updatedById,
  }: {
    languageId: string
    data: UpdateLanguageBodyType
    updatedById: number
  }) {
    try {
      return await this.languageRepository.update({ languageId, data, updatedById })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw LanguageAlreadyExistsException
      }

      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }

      throw error
    }
  }

  async delete(languageId: string) {
    try {
      // Xoá cứng
      await this.languageRepository.delete(languageId, true)
      return {
        message: 'Message.DeleteSuccessfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }

      throw error
    }
  }
}
