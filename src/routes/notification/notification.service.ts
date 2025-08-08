import { Injectable } from '@nestjs/common'
import { NotificationRepository } from './notification.repo'
import { CreateNotificationType } from './notification.model'
import { NotificationGateway } from './notification.gateway'

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  list(userId: number) {
    return this.notificationRepository.list(userId)
  }

  async create(notification: CreateNotificationType) {
    const newNotification = await this.notificationRepository.create(notification)
    this.notificationGateway.handleNotificationCreated(newNotification)
    return newNotification
  }

  markAsRead(id: number) {
    return this.notificationRepository.markAsRead(id)
  }
}
