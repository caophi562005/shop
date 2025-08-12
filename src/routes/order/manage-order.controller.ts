import { Controller, Get, Query, Patch, Param, Body } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  GetOrderListQueryDTO,
  GetOrderListResDTO,
  GetOrderParamsDTO,
  UpdateOrderBodyDTO,
  UpdateOrderResDTO,
} from './order.dto'
import { ManageOrderService } from './manage-order.service'

@Controller('manage-orders')
export class ManageOrderController {
  constructor(private readonly manageOrderService: ManageOrderService) {}

  @Get()
  @ZodSerializerDto(GetOrderListResDTO)
  getAllOrder(@Query() query: GetOrderListQueryDTO) {
    return this.manageOrderService.listAll(query)
  }

  @Patch(':orderId')
  @ZodSerializerDto(UpdateOrderResDTO)
  updateOrder(@Param() params: GetOrderParamsDTO, @Body() body: UpdateOrderBodyDTO) {
    return this.manageOrderService.updateOrder({ orderId: params.orderId, body })
  }
}
