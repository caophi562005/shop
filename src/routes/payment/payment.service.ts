import { Injectable } from '@nestjs/common'
import { SharedNotificationRepository } from 'src/shared/repositories/shared-notification.repo'
import { PaymentGateway } from './payment.gateway'
import { WebhookPaymentBodyType } from './payment.model'
import { PaymentRepository } from './payment.repo'

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
      content: `Bạn đã thanh toán #${paymentId} thành công.`,
    })
    return {
      message: 'Payment success',
    }
  }
}
