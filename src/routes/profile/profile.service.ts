import { Injectable } from '@nestjs/common'
import { NotFoundRecordException } from 'src/shared/errror'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { HashingService } from 'src/shared/services/hashing.service'
import { ChangePasswordBodyType, UpdateMeBodyType } from './profile.model'
import { isNotFoundPrismaError } from 'src/shared/helpers'
import { InvalidPasswordException } from './profile.error'

@Injectable()
export class ProfileService {
  constructor(
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly hashingService: HashingService,
  ) {}

  async getProfile(userId: number) {
    const user = await this.sharedUserRepository.findUniqueIncludeRolePermission({ id: userId })

    if (!user) {
      throw NotFoundRecordException
    }
    return user
  }

  async updateProfile({ userId, data }: { userId: number; data: UpdateMeBodyType }) {
    try {
      return await this.sharedUserRepository.update(
        { id: userId },
        {
          ...data,
          updatedById: userId,
        },
      )
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async changePassword({ userId, data }: { userId: number; data: ChangePasswordBodyType }) {
    try {
      const { password, newPassword } = data
      const user = await this.sharedUserRepository.findUnique({ id: userId })
      if (!user) {
        throw NotFoundRecordException
      }

      const isPasswordMatch = await this.hashingService.compare(password, user.password)
      if (!isPasswordMatch) {
        throw InvalidPasswordException
      }

      const hashedPassword = await this.hashingService.hash(newPassword)
      await this.sharedUserRepository.update({ id: userId }, { password: hashedPassword })
      return {
        message: 'Message.ChangePasswordSuccessfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
    }
  }
}
