import { Module } from '@nestjs/common'
import { NotificationController } from './notification.controller'
import { NotificationAdminController } from './notification-admin.controller'
import { NotificationService } from './notification.service'
import { NotificationRepository } from './notification.repo'
import { NotificationGateway } from './notification.gateway'

@Module({
  controllers: [NotificationController, NotificationAdminController],
  providers: [NotificationService, NotificationRepository, NotificationGateway],
})
export class NotificationModule {}
