import { Controller, Get, Param } from '@nestjs/common'
import { MessageService } from './message.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { GetMessagesParamsDTO } from './message.dto'
import { RoleName } from 'src/shared/constants/role.constant'

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get(':toUserId')
  list(
    @ActiveUser('userId') userId: number,
    @ActiveUser('roleName') roleName: string,
    @Param() params: GetMessagesParamsDTO,
  ) {
    // Nếu là client, họ chỉ có thể xem tin nhắn với support (toUserId = 0)
    if (roleName === RoleName.CLIENT) {
      return this.messageService.getClientSupportHistory(userId)
    }

    // Nếu là staff/admin, họ có thể xem tin nhắn với client cụ thể
    if (roleName === RoleName.SELLER || roleName === RoleName.ADMIN) {
      return this.messageService.getClientSupportHistory(params.toUserId)
    }

    // Fallback cho trường hợp khác
    return this.messageService.listMessages(userId, params.toUserId)
  }

  // Endpoint mới cho staff lấy danh sách client
  @Get()
  getClientList(@ActiveUser('roleName') roleName: string) {
    if (roleName === RoleName.SELLER || roleName === RoleName.ADMIN) {
      return this.messageService.getRecentClientChats()
    }

    return { message: 'Unauthorized' }
  }
}
