import { Module } from '@nestjs/common'
import { NotificationController } from './notification.controller'
import { NotificationAdminController } from './notification-admin.controller'
import { NotificationService } from './notification.service'
import { UserRepository } from '../user/user.repo'
import { NotificationGateway } from '../../websockets/notification.gateway'

@Module({
  controllers: [NotificationController, NotificationAdminController],
  providers: [NotificationService, UserRepository, NotificationGateway],
})
export class NotificationModule {}
