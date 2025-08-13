import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreateNotificationType } from '../models/shared-notification.model'
import { NotificationGateway } from 'src/websockets/notification.gateway'

@Injectable()
export class SharedNotificationRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  list(userId: number) {
    return this.prismaService.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: CreateNotificationType) {
    const newNotification = await this.prismaService.notification.create({ data })
    this.notificationGateway.handleNotificationCreated(newNotification)
    return newNotification
  }

  markAsRead(id: number) {
    return this.prismaService.notification.update({
      where: { id },
      data: { readAt: new Date() },
    })
  }

  delete(id: number) {
    return this.prismaService.notification.delete({
      where: { id },
    })
  }
}
