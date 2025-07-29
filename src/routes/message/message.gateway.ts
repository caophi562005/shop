import { ValidationPipe } from '@nestjs/common'
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { CreateMessageDTO } from './message.dto'
import { Socket } from 'socket.io'
import { MessageService } from './message.service'
import { Server } from 'socket.io'
import { generateRoomUserId } from 'src/shared/helpers'

@WebSocketGateway({ namespace: 'message' })
export class MessageGateway {
  constructor(private readonly messageService: MessageService) {}

  @WebSocketServer()
  server: Server
  @SubscribeMessage('send-message')
  async handleEvent(@MessageBody() message: CreateMessageDTO, @ConnectedSocket() client: Socket) {
    const fromUserId = client.data.userId
    const newMessage = await this.messageService.createMessage(message, fromUserId)
    const recipientRoom = generateRoomUserId(message.toUserId)
    this.server.to(recipientRoom).emit('newMessage', newMessage)

    // 3. Gửi lại tin nhắn cho chính người gửi để cập nhật UI của họ.
    client.emit('newMessage', newMessage)
  }
}
