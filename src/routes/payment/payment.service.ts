import { Injectable } from '@nestjs/common'
import { PaymentRepository } from './payment.repo'
import { WebhookPaymentBodyType } from './payment.model'
import { PaymentGateway } from './payment.gateway'

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async receiver(body: WebhookPaymentBodyType) {
    const paymentId = await this.paymentRepository.receiver(body)
    if (paymentId) {
      this.paymentGateway.handlePaymentSuccess(paymentId)
    }
    return {
      message: 'Payment success',
    }
  }
}
