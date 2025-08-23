import { Module } from '@nestjs/common'
import { OrderController } from './order.controller'
import { OrderService } from './order.service'
import { OrderRepository } from './order.repo'
import { BullModule } from '@nestjs/bullmq'
import { OrderProducer } from './order.producer'
import { PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant'
import { OrderRevenueController } from './order-revenue.controller'
import { OrderRevenueService } from './order-revenue.service'
import { ManageOrderController } from './manage-order.controller'
import { ManageOrderService } from './manage-order.service'
import { ProductGateway } from '../product/product.gateway'

@Module({
  controllers: [OrderController, OrderRevenueController, ManageOrderController],
  providers: [OrderService, OrderRepository, OrderProducer, OrderRevenueService, ManageOrderService, ProductGateway],
  imports: [
    BullModule.registerQueue({
      name: PAYMENT_QUEUE_NAME,
    }),
  ],
})
export class OrderModule {}
