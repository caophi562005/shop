import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreateNotificationType } from './notification.model'

@Injectable()
export class NotificationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  list(userId: number) {
    return this.prismaService.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  create(data: CreateNotificationType) {
    return this.prismaService.notification.create({ data })
  }

  markAsRead(id: number) {
    return this.prismaService.notification.update({
      where: { id },
      data: { readAt: new Date() },
    })
  }
}
