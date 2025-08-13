import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { generateRoomUserId } from 'src/shared/helpers'
import { NotificationType } from 'src/shared/models/shared-notification.model'

@WebSocketGateway({ namespace: 'notification' })
export class NotificationGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server

  handleConnection(client: Socket) {
    const userId = client.data.userId
    if (userId) {
      const room = generateRoomUserId(userId)
      client.join(room)
    }
  }

  handleNotificationCreated(notification: NotificationType) {
    const room = generateRoomUserId(notification.userId)
    this.server.to(room).emit('newNotification', notification)
  }
}
