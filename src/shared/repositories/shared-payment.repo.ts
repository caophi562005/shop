import { Injectable } from '@nestjs/common'
import { PrismaService } from '../services/prisma.service'
import { OrderStatus } from '@prisma/client'
import { PaymentStatus } from '../constants/payment.constant'
import { SharedNotificationRepository } from './shared-notification.repo'

@Injectable()
export class SharedPaymentRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sharedNotificationRepository: SharedNotificationRepository,
  ) {}

  async cancelPaymentAndOrder(paymentId: number) {
    const payment = await this.prismaService.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    })

    if (!payment) {
      throw Error('Payment not found')
    }
    if (payment.status === PaymentStatus.FAILED) {
      return
    }
    const { order } = payment
    if (!order) {
      throw Error('Order not found')
    }

    const userId = order.userId

    const productSKUSnapshots = order.items
    await this.prismaService.$transaction(async (tx) => {
      const updateOrder$ = tx.order.update({
        where: {
          id: order.id,
          status: OrderStatus.PENDING_PAYMENT,
          deletedAt: null,
        },
        data: {
          status: OrderStatus.CANCELLED,
        },
      })

      const updateSkus$ = Promise.all(
        productSKUSnapshots
          .filter((item) => item.skuId)
          .map((item) =>
            tx.sKU.update({
              where: {
                id: item.skuId as number,
              },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            }),
          ),
      )

      const updatePayment$ = tx.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: PaymentStatus.FAILED,
        },
      })

      const notification$ = this.sharedNotificationRepository.create({
        userId,
        content: `Your payment #${paymentId} has been cancelled.`,
      })

      return await Promise.all([updateOrder$, updateSkus$, updatePayment$, notification$])
    })
  }
}
