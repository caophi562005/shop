import { Body, Controller, Post } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { CreateNotificationDTO, BroadcastNotificationDTO, BroadcastToAllNotificationDTO } from './notification.dto'
import { ActiveUser } from '../../shared/decorators/active-user.decorator'
import { AccessTokenPayload } from '../../shared/types/jwt.type'

@Controller('notifications-admin')
export class NotificationAdminController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() body: CreateNotificationDTO) {
    return this.notificationService.create(body)
  }

  @Post('broadcast')
  broadcastNotification(@Body() body: BroadcastNotificationDTO, @ActiveUser() admin: AccessTokenPayload) {
    return this.notificationService.broadcastNotification(body, admin.userId)
  }
}
