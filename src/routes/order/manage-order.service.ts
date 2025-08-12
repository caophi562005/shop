import { Injectable } from '@nestjs/common'
import { OrderRepository } from './order.repo'
import { GetOrderListQueryType, UpdateOrderBodyType } from './order.model'

@Injectable()
export class ManageOrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  listAll(query: GetOrderListQueryType) {
    return this.orderRepository.listAll(query)
  }

  updateOrder({ orderId, body }: { orderId: number; body: UpdateOrderBodyType }) {
    return this.orderRepository.update({ orderId, body })
  }
}
