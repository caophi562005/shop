import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { NotificationService } from './notification.service'
import { CreateNotificationDTO, MarkAsReadParamsDTO } from './notification.dto'

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  list(@ActiveUser('userId') userId: number) {
    return this.notificationService.list(userId)
  }

  @Post()
  create(@Body() body: CreateNotificationDTO) {
    return this.notificationService.create(body)
  }

  @Patch(':id/read')
  markAsRead(@Param() params: MarkAsReadParamsDTO) {
    return this.notificationService.markAsRead(params.id)
  }
}
