import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreateLanguageBodyType, GetLanguageDetailType, LanguageType, UpdateLanguageBodyType } from './language.model'

@Injectable()
export class LanguageRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findAll(): Promise<LanguageType[]> {
    return this.prismaService.language.findMany({
      where: {
        deletedAt: null,
      },
    })
  }

  findById(id: string): Promise<GetLanguageDetailType | null> {
    return this.prismaService.language.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })
  }

  create({ createdById, data }: { createdById: number; data: CreateLanguageBodyType }): Promise<LanguageType> {
    return this.prismaService.language.create({
      data: {
        ...data,
        createdById,
      },
    })
  }

  update({
    languageId,
    updatedById,
    data,
  }: {
    languageId: string
    updatedById: number
    data: UpdateLanguageBodyType
  }): Promise<LanguageType> {
    return this.prismaService.language.update({
      where: {
        id: languageId,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById,
      },
    })
  }

  delete(
    { languageId, deletedById }: { languageId: string; deletedById: number },
    isHard?: boolean,
  ): Promise<LanguageType> {
    return isHard
      ? this.prismaService.language.delete({
          where: {
            id: languageId,
          },
        })
      : this.prismaService.language.update({
          where: {
            id: languageId,
            deletedAt: null,
          },
          data: {
            deletedById,
            deletedAt: new Date(),
          },
        })
  }
}
