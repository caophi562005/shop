import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { CreateMessageDTO } from './message.dto'
import { Socket } from 'socket.io'
import { MessageService } from './message.service'
import { Server } from 'socket.io'
import { generateRoomUserId, generateStaffRoom } from 'src/shared/helpers'
import { RoleName } from 'src/shared/constants/role.constant'

@WebSocketGateway({ namespace: 'message' })
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly messageService: MessageService) {}

  @WebSocketServer()
  server: Server

  async handleConnection(client: Socket) {
    const { userId, roleName } = client.data as { userId: number; roleName: string }

    if (roleName === RoleName.CLIENT) {
      const clientRoom = generateRoomUserId(userId)
      await client.join(clientRoom)
      console.log(`Client ${userId} joined room: ${clientRoom}`)
    } else if (roleName === RoleName.SELLER || roleName === RoleName.ADMIN) {
      // SELLER join vào room chung để nhận notifications
      await client.join(generateStaffRoom())
      console.log(`SELLER ${userId} joined SELLER room`)
    }
  }

  async handleDisconnect(client: Socket) {
    const { userId, roleName } = client.data as { userId: number; roleName: string }

    if (roleName === RoleName.CLIENT) {
      this.server.to(generateStaffRoom()).emit('client-offline', {
        clientId: userId,
      })
    }
  }

  @SubscribeMessage('join-client-chat')
  async handleJoinClientChat(@MessageBody() data: { clientUserId: number }, @ConnectedSocket() client: Socket) {
    const { roleName } = client.data as { userId: number; roleName: string }

    if (roleName === RoleName.SELLER || roleName === RoleName.ADMIN) {
      const clientRoom = generateRoomUserId(data.clientUserId)
      await client.join(clientRoom)
    }
  }

  @SubscribeMessage('leave-client-chat')
  async handleLeaveClientChat(@MessageBody() data: { clientUserId: number }, @ConnectedSocket() client: Socket) {
    const { roleName } = client.data as { userId: number; roleName: string }

    if (roleName === RoleName.SELLER || roleName === RoleName.ADMIN) {
      const clientRoom = generateRoomUserId(data.clientUserId)
      await client.leave(clientRoom)
    }
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(@MessageBody() message: CreateMessageDTO, @ConnectedSocket() client: Socket) {
    const { userId: fromUserId, roleName } = client.data as { userId: number; roleName: string }

    const newMessage = await this.messageService.createMessage(message, fromUserId)

    if (roleName === RoleName.CLIENT) {
      const clientRoom = generateRoomUserId(fromUserId)

      // Gửi tin nhắn trong room của client (bao gồm cả SELLER đang join)
      this.server.to(clientRoom).emit('newMessage', newMessage)
    } else if (roleName === RoleName.SELLER || roleName === RoleName.ADMIN) {
      const clientRoom = generateRoomUserId(message.toUserId)

      // Tạo payload để client chỉ thấy "Support" làm người gửi
      const supportMessage = {
        ...newMessage,
        fromUser: {
          id: 0,
          name: 'Support',
        },
      }

      this.server.to(clientRoom).emit('newMessage', supportMessage)
    }
  }

  // Lấy danh sách client đang online hoặc có tin nhắn gần đây
  @SubscribeMessage('get-client-list')
  async handleGetClientList(@ConnectedSocket() client: Socket) {
    const { roleName } = client.data as { userId: number; roleName: string }

    if (roleName === RoleName.SELLER || roleName === RoleName.ADMIN) {
      // Lấy danh sách client có tin nhắn gần đây
      const recentChats = await this.messageService.getRecentClientChats()

      client.emit('client-list', recentChats)
    }
  }
}
