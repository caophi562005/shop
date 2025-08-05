import { Module } from '@nestjs/common'
import { OrderController } from './order.controller'
import { OrderService } from './order.service'
import { OrderRepository } from './order.repo'
import { BullModule } from '@nestjs/bullmq'
import { OrderProducer } from './order.producer'
import { PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant'
import { OrderRevenueController } from './order-revenue.controller'
import { OrderRevenueService } from './order-revenue.service'

@Module({
  controllers: [OrderController, OrderRevenueController],
  providers: [OrderService, OrderRepository, OrderProducer, OrderRevenueService],
  imports: [
    BullModule.registerQueue({
      name: PAYMENT_QUEUE_NAME,
    }),
  ],
})
export class OrderModule {}
