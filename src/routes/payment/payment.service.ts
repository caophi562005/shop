import { Injectable } from '@nestjs/common'
import { PaymentRepository } from './payment.repo'
import { WebhookPaymentBodyType } from './payment.model'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { generateRoomUserId } from 'src/shared/helpers'

@Injectable()
@WebSocketGateway({ namespace: 'payment' })
export class PaymentService {
  @WebSocketServer()
  server: Server

  constructor(private readonly paymentRepository: PaymentRepository) {}

  async receiver(body: WebhookPaymentBodyType) {
    const userId = await this.paymentRepository.receiver(body)
    this.server.to(generateRoomUserId(userId)).emit('payment', {
      status: 'success',
    })
    return {
      message: 'Payment success',
    }
  }
}
