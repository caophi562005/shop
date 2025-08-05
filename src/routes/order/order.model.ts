import { PaginationQuerySchema } from 'src/shared/models/request.model'
import { OrderSchema, OrderStatusSchema, ProductSKUSnapshotSchema } from 'src/shared/models/shared-order.model'
import { z } from 'zod'

export const GetOrderListResSchema = z.object({
  data: z.array(
    OrderSchema.extend({
      items: z.array(ProductSKUSnapshotSchema),
    }).omit({
      receiver: true,
      deletedAt: true,
      deletedById: true,
      createdById: true,
      updatedById: true,
    }),
  ),
  page: z.number(),
  limit: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
})

export const GetOrderListQuerySchema = PaginationQuerySchema.extend({
  status: OrderStatusSchema.optional(),
})

export const GetOrderDetailResSchema = OrderSchema.extend({
  items: z.array(ProductSKUSnapshotSchema),
})

export const CreateOrderBodySchema = z.object({
  receiver: z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
    email: z.string().email(),
    note: z.string().default(''),
  }),
  cartItemIds: z.array(z.number()).min(1),
})

export const CreateOrderResSchema = z.object({
  data: OrderSchema,
})

export const CancelOrderResSchema = OrderSchema

export const GetOrderParamsSchema = z
  .object({
    orderId: z.coerce.number().int().positive(),
  })
  .strict()

export type GetOrderParamsType = z.infer<typeof GetOrderParamsSchema>
export type OrderType = z.infer<typeof OrderSchema>
export type GetOrderListResType = z.infer<typeof GetOrderListResSchema>
export type GetOrderListQueryType = z.infer<typeof GetOrderListQuerySchema>
export type GetOrderDetailResType = z.infer<typeof GetOrderDetailResSchema>
export type CreateOrderBodyType = z.infer<typeof CreateOrderBodySchema>
export type CreateOrderResType = z.infer<typeof CreateOrderResSchema>
export type CancelOrderResType = z.infer<typeof CancelOrderResSchema>
