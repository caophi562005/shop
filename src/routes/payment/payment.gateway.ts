import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { generateRoomPaymentId } from 'src/shared/helpers'

@WebSocketGateway({ namespace: 'payment' })
export class PaymentGateway {
  @WebSocketServer()
  server: Server

  @SubscribeMessage('joinPaymentRoom')
  handleJoinRoom(@MessageBody() paymentId: number, @ConnectedSocket() client: Socket) {
    const roomName = generateRoomPaymentId(paymentId)
    client.join(roomName)
  }

  @SubscribeMessage('leavePaymentRoom')
  handleLeaveRoom(@MessageBody() paymentId: number, @ConnectedSocket() client: Socket) {
    const roomName = generateRoomPaymentId(paymentId)
    client.leave(roomName)
  }

  handlePaymentSuccess(paymentId: number) {
    const roomName = generateRoomPaymentId(paymentId)
    this.server.to(roomName).emit('successPaymentId', paymentId)
  }
}
