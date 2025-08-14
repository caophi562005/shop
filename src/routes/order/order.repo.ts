import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CancelOrderResType,
  CreateOrderBodyType,
  CreateOrderResType,
  GetOrderDetailResType,
  GetOrderListQueryType,
  GetOrderListResType,
  UpdateOrderBodyType,
  UpdateOrderResType,
} from './order.model'
import { Prisma } from '@prisma/client'
import { OrderStatus } from 'src/shared/constants/order.constant'
import {
  CannotCancelOrderException,
  NotFoundCartItemException,
  OrderNotFoundException,
  OutOfStockSKUException,
  ProductNotFoundException,
} from './order.error'
import { isNotFoundPrismaError } from 'src/shared/helpers'
import { PaymentStatus } from 'src/shared/constants/payment.constant'
import { OrderProducer } from './order.producer'
import { OrderInProductSKUSnapshotType } from 'src/shared/models/shared-order.model'

@Injectable()
export class OrderRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly orderProducer: OrderProducer,
  ) {}

  private getTotalPrice(order: OrderInProductSKUSnapshotType) {
    let totalPrice = 0
    order.items.map((item) => {
      totalPrice += item.skuPrice * item.quantity
    })
    return totalPrice
  }

  async getAll() {
    const orders = await this.prismaService.order.findMany({
      where: {
        status: {
          notIn: [OrderStatus.CANCELLED, OrderStatus.PENDING_PAYMENT],
        },
      },
      include: {
        items: true,
      },
    })

    const revenueWithTotal = orders.map((order) => ({
      id: order.id,
      status: order.status,
      totalPrice: this.getTotalPrice(order),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }))

    return {
      revenue: revenueWithTotal,
    }
  }

  async listAll(query: GetOrderListQueryType): Promise<GetOrderListResType> {
    const skip = (query.page - 1) * query.limit
    const take = query.limit

    const where: Prisma.OrderWhereInput = {
      status: query.status,
    }

    const [totalItems, data] = await Promise.all([
      this.prismaService.order.count({
        where,
      }),
      this.prismaService.order.findMany({
        where,
        include: {
          items: true,
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ])

    return {
      data,
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / query.limit),
    }
  }

  async list({ userId, query }: { userId: number; query: GetOrderListQueryType }): Promise<GetOrderListResType> {
    const skip = (query.page - 1) * query.limit
    const take = query.limit

    const where: Prisma.OrderWhereInput = {
      userId,
      status: query.status,
    }

    const [totalItems, data] = await Promise.all([
      this.prismaService.order.count({
        where,
      }),
      this.prismaService.order.findMany({
        where,
        include: {
          items: true,
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ])

    return {
      data,
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / query.limit),
    }
  }

  async create({ userId, body }: { userId: number; body: CreateOrderBodyType }): Promise<CreateOrderResType> {
    // Kiểm tra xem các cartItemIds có tồn tại trong cơ sở dữ liệu
    const allBodyCartItemIds = body.cartItemIds

    const cartItems = await this.prismaService.cartItem.findMany({
      where: {
        id: {
          in: allBodyCartItemIds,
        },
        userId,
      },
      include: {
        sku: {
          include: {
            product: {
              include: {
                productTranslations: true,
              },
            },
          },
        },
      },
    })

    if (cartItems.length !== allBodyCartItemIds.length) {
      throw NotFoundCartItemException
    }

    // Kiểm tra xem số lượng mua có lơn hơn tồn kho
    const isOutOfStock = cartItems.some((item) => {
      return item.sku.stock < item.quantity
    })

    if (isOutOfStock) {
      throw OutOfStockSKUException
    }

    // Kiểm tra xem tất cả sản phẩm mua , có sản phẩm nào bị xoá hay ẩn k
    const isExistNotReadyProduct = cartItems.some(
      (item) =>
        item.sku.product.deletedAt !== null ||
        item.sku.product.publishedAt === null ||
        item.sku.product.publishedAt > new Date(),
    )

    if (isExistNotReadyProduct) {
      throw ProductNotFoundException
    }

    const cartItemMap = new Map<number, (typeof cartItems)[0]>()
    cartItems.forEach((item) => {
      cartItemMap.set(item.id, item)
    })

    // Tạo order và xoá cartItem
    const [orders] = await this.prismaService.$transaction(async (tx) => {
      // Tạo payment record - COD vẫn cần payment record để track
      const payment = await tx.payment.create({
        data: {
          status: PaymentStatus.PENDING, // COD sẽ thanh toán khi nhận hàng
        },
      })
      const orders$ = tx.order.create({
        data: {
          userId,
          // Nếu COD thì chuyển thẳng sang PENDING_PICKUP, không cần chờ payment
          status: body.isCOD === true ? OrderStatus.PENDING_PICKUP : OrderStatus.PENDING_PAYMENT,
          receiver: body.receiver,
          createdById: userId,
          paymentId: payment.id,
          items: {
            create: allBodyCartItemIds.map((cartItemId) => {
              const cartItem = cartItemMap.get(cartItemId)!
              return {
                productName: cartItem.sku.product.name,
                skuPrice: cartItem.sku.price,
                image: cartItem.sku.image,
                skuId: cartItem.skuId,
                skuValue: cartItem.sku.value,
                quantity: cartItem.quantity,
                productId: cartItem.sku.productId,
                productTranslation: cartItem.sku.product.productTranslations.map((translation) => {
                  return {
                    id: translation.id,
                    name: translation.name,
                    description: translation.description,
                    languageId: translation.languageId,
                  }
                }),
              }
            }),
          },
          products: {
            connect: allBodyCartItemIds.map((cartItemId) => {
              const cartItem = cartItemMap.get(cartItemId)!
              return {
                id: cartItem.sku.product.id,
              }
            }),
          },
        },
      })
      const cartItem$ = tx.cartItem.deleteMany({
        where: {
          id: {
            in: allBodyCartItemIds,
          },
        },
      })
      const sku$ = Promise.all(
        cartItems.map((item) =>
          tx.sKU.update({
            where: {
              id: item.sku.id,
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          }),
        ),
      )
      const addCancelPaymentJob$ = this.orderProducer.cancelPaymentJob(payment.id)
      const [orders] = await Promise.all([orders$, cartItem$, sku$, addCancelPaymentJob$])
      return [orders]
    })
    return {
      data: orders,
    }
  }

  async detail({ userId, orderId }: { userId: number; orderId: number }): Promise<GetOrderDetailResType | null> {
    const order = await this.prismaService.order.findUnique({
      where: {
        id: orderId,
        userId,
        deletedAt: null,
      },
      include: {
        items: true,
      },
    })
    if (!order) {
      throw OrderNotFoundException
    }
    return order
  }

  async cancel({ userId, orderId }: { userId: number; orderId: number }): Promise<CancelOrderResType> {
    try {
      const order = await this.prismaService.order.findUniqueOrThrow({
        where: {
          id: orderId,
          userId,
          deletedAt: null,
        },
        include: {
          items: true,
        },
      })
      if (order.status === OrderStatus.CANCELLED) {
        throw CannotCancelOrderException
      }

      const [cancel] = await this.prismaService.$transaction(async (tx) => {
        const cancelOrder$ = tx.order.update({
          where: {
            id: orderId,
            userId,
            deletedAt: null,
          },
          data: {
            status: OrderStatus.CANCELLED,
            updatedById: userId,
          },
        })
        const sku$ = Promise.all(
          order.items.map((item) =>
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
        const payment$ = tx.payment.update({
          where: {
            id: order.paymentId,
          },
          data: {
            status: PaymentStatus.FAILED,
          },
        })
        const [cancelOrder] = await Promise.all([cancelOrder$, sku$, payment$])
        return [cancelOrder]
      })

      return cancel
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw OrderNotFoundException
      }
      throw error
    }
  }

  async update({ orderId, body }: { orderId: number; body: UpdateOrderBodyType }): Promise<UpdateOrderResType> {
    try {
      const updateData: any = {}

      if (body.status !== undefined) {
        updateData.status = body.status
      }

      if (body.receiver !== undefined) {
        const currentOrder = await this.prismaService.order.findUniqueOrThrow({
          where: { id: orderId },
          select: { receiver: true },
        })

        updateData.receiver = {
          ...currentOrder.receiver,
          ...Object.fromEntries(Object.entries(body.receiver).filter(([_, value]) => value !== undefined)),
        }
      }

      const updatedOrder = await this.prismaService.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          items: true,
        },
      })

      return updatedOrder
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw OrderNotFoundException
      }
      throw error
    }
  }
}
