import { Injectable } from '@nestjs/common'
import { CreateNotificationType } from 'src/shared/models/shared-notification.model'
import { SharedNotificationRepository } from 'src/shared/repositories/shared-notification.repo'
import { BroadcastNotificationType } from './notification.model'
import { UserRepository } from '../user/user.repo'
import { NotificationGateway } from '../../websockets/notification.gateway'

@Injectable()
export class NotificationService {
  constructor(
    private readonly sharedNotificationRepository: SharedNotificationRepository,
    private readonly userRepository: UserRepository,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  list(userId: number) {
    return this.sharedNotificationRepository.list(userId)
  }

  create(notification: CreateNotificationType) {
    return this.sharedNotificationRepository.create(notification)
  }

  markAsRead(id: number) {
    return this.sharedNotificationRepository.markAsRead(id)
  }

  delete(id: number) {
    return this.sharedNotificationRepository.delete(id)
  }

  async broadcastNotification(data: BroadcastNotificationType, adminUserId: number) {
    try {
      let targetUserIds: number[] = []

      if (data.broadcastToAll) {
        const users = await this.userRepository.list({ page: 1, limit: 10000 })
        targetUserIds = users.data.map((user) => user.id)
      } else if (data.userIds && data.userIds.length > 0) {
        targetUserIds = data.userIds
      } else {
        throw new Error('Either broadcastToAll must be true or userIds must be provided')
      }

      const createPromises = targetUserIds.map((userId) =>
        this.sharedNotificationRepository.create({
          userId,
          content: data.title ? `${data.title}: ${data.content}` : data.content,
        }),
      )

      const notifications = await Promise.allSettled(createPromises)
      const successfulNotifications = notifications
        .filter((result) => result.status === 'fulfilled')
        .map((result) => (result as PromiseFulfilledResult<any>).value)

      for (const notification of successfulNotifications) {
        this.notificationGateway.handleNotificationCreated(notification)
      }

      const successCount = successfulNotifications.length
      const failureCount = targetUserIds.length - successCount

      return {
        success: true,
        message: 'Notifications broadcasted successfully',
        totalTargets: targetUserIds.length,
        successfulSends: successCount,
        failedSends: failureCount,
        broadcastToAll: data.broadcastToAll,
      }
    } catch (error) {
      throw new Error(`Failed to broadcast notification: ${error.message}`)
    }
  }
}
