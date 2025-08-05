import { Injectable } from '@nestjs/common'
import { OrderRepository } from './order.repo'

@Injectable()
export class OrderRevenueService {
  constructor(private readonly orderRepository: OrderRepository) {}

  getAll() {
    return this.orderRepository.getAll()
  }
}
