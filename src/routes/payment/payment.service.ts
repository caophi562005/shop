import { Injectable } from '@nestjs/common'
import { PaymentRepository } from './payment.repo'
import { WebhookPaymentBodyType } from './payment.model'
import { PaymentGateway } from './payment.gateway'
import { SharedNotificationRepository } from 'src/shared/repositories/shared-notification.repo'

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentGateway: PaymentGateway,
    private readonly sharedNotificationService: SharedNotificationRepository,
  ) {}

  async receiver(body: WebhookPaymentBodyType) {
    const { paymentId, userId } = await this.paymentRepository.receiver(body)
    if (paymentId) {
      this.paymentGateway.handlePaymentSuccess(paymentId)
    }
    this.sharedNotificationService.create({
      userId,
      content: `Your payment #${paymentId} has been received.`,
    })
    return {
      message: 'Payment success',
    }
  }
}
