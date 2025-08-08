import { Module } from '@nestjs/common'
import { NotificationController } from './notification.controller'
import { NotificationService } from './notification.service'
import { NotificationRepository } from './notification.repo'
import { NotificationGateway } from './notification.gateway'

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, NotificationRepository, NotificationGateway],
})
export class NotificationModule {}
