import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { GetProductDetailResType } from './product.model'
import { generateRoomProductId } from 'src/shared/helpers'

@WebSocketGateway({ namespace: 'product' })
export class ProductGateway {
  @WebSocketServer()
  server: Server

  @SubscribeMessage('joinProductRoom')
  handleJoinRoom(@MessageBody() productId: number, @ConnectedSocket() client: Socket) {
    const roomName = generateRoomProductId(productId)
    client.join(roomName)
  }

  @SubscribeMessage('leaveProductRoom')
  handleLeaveRoom(@MessageBody() productId: number, @ConnectedSocket() client: Socket) {
    const roomName = generateRoomProductId(productId)
    client.leave(roomName)
  }

  handleProductUpdate(product: GetProductDetailResType) {
    const roomName = generateRoomProductId(product.id)
    this.server.to(roomName).emit('productUpdated', product)
  }

  handleProductDelete(productId: number) {
    const roomName = generateRoomProductId(productId)
    this.server.to(roomName).emit('productDeleted', { message: 'Sản phẩm đã bị xóa' })
  }
}
