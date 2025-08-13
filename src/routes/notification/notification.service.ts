import { Injectable } from '@nestjs/common'
import { CreateNotificationType } from 'src/shared/models/shared-notification.model'
import { SharedNotificationRepository } from 'src/shared/repositories/shared-notification.repo'

@Injectable()
export class NotificationService {
  constructor(private readonly sharedNotificationRepository: SharedNotificationRepository) {}

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
}
