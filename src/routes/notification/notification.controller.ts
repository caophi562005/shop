import { Controller, Delete, Get, Param, Patch } from '@nestjs/common'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { NotificationService } from './notification.service'
import { DeleteNotificationParamsDTO, MarkAsReadParamsDTO } from './notification.dto'

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  list(@ActiveUser('userId') userId: number) {
    return this.notificationService.list(userId)
  }

  @Patch(':id/read')
  markAsRead(@Param() params: MarkAsReadParamsDTO) {
    return this.notificationService.markAsRead(params.id)
  }

  @Delete(':id')
  delete(@Param() params: DeleteNotificationParamsDTO) {
    return this.notificationService.delete(params.id)
  }
}
