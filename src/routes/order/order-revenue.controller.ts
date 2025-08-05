import { Controller, Get } from '@nestjs/common'

import { OrderRevenueService } from './order-revenue.service'

@Controller('order-revenue')
export class OrderRevenueController {
  constructor(private readonly orderRevenueService: OrderRevenueService) {}

  @Get()
  // @ZodSerializerDto(GetCategoriesResDTO)
  getAll() {
    return this.orderRevenueService.getAll()
  }
}
