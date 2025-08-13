import { Injectable } from '@nestjs/common'
import { OrderRepository } from './order.repo'
import { GetOrderListQueryType, UpdateOrderBodyType } from './order.model'
import { SharedNotificationRepository } from 'src/shared/repositories/shared-notification.repo'

@Injectable()
export class ManageOrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly sharedNotificationService: SharedNotificationRepository,
  ) {}

  listAll(query: GetOrderListQueryType) {
    return this.orderRepository.listAll(query)
  }

  async updateOrder({ orderId, body }: { orderId: number; body: UpdateOrderBodyType }) {
    const updatedOrder = await this.orderRepository.update({ orderId, body })
    this.sharedNotificationService.create({
      userId: updatedOrder.userId,
      content: `Trạng thái đơn hàng #${orderId} đã được cập nhật thành ${body.status}.`,
    })
    return updatedOrder
  }
}
