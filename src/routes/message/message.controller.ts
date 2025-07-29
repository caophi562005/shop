import { Controller, Get, Param } from '@nestjs/common'
import { MessageService } from './message.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { GetMessagesParamsDTO } from './message.dto'

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get(':toUserId')
  list(@ActiveUser('userId') userId: number, @Param() params: GetMessagesParamsDTO) {
    return this.messageService.listMessages(userId, params.toUserId)
  }
}
