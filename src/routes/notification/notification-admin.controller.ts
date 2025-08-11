import { Body, Controller, Post } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { CreateNotificationDTO } from './notification.dto'

@Controller('notifications-admin')
export class NotificationAdminController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() body: CreateNotificationDTO) {
    return this.notificationService.create(body)
  }
}
