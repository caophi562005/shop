import { Module } from '@nestjs/common'
import { NotificationController } from './notification.controller'
import { NotificationAdminController } from './notification-admin.controller'
import { NotificationService } from './notification.service'

@Module({
  controllers: [NotificationController, NotificationAdminController],
  providers: [NotificationService],
})
export class NotificationModule {}
