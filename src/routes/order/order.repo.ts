import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CancelOrderResType,
  CreateOrderBodyType,
  CreateOrderResType,
  GetOrderDetailResType,
  GetOrderListQueryType,
  GetOrderListResType,
} from './order.model'
import { Prisma } from '@prisma/client'
import { OrderStatus } from 'src/shared/constants/order.constant'
import {
  CannotCancelOrderException,
  NotFoundCartItemException,
  OrderNotFoundException,
  OutOfStockSKUException,
  ProductNotFoundException,
  SKUNotBelongToShopException,
} from './order.error'
import { isNotFoundPrismaError } from 'src/shared/helpers'
import { PaymentStatus } from 'src/shared/constants/payment.constant'
import { OrderProducer } from './order.producer'

@Injectable()
export class OrderRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly orderProducer: OrderProducer,
  ) {}

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
      const payment = await tx.payment.create({
        data: {
          status: PaymentStatus.PENDING,
        },
      })
      const orders$ = tx.order.create({
        data: {
          userId,
          status: OrderStatus.PENDING_PAYMENT,
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
      const sku$ = Promise.all([
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
      ])
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
      })
      if (order.status !== OrderStatus.CANCELLED) {
        throw CannotCancelOrderException
      }

      const updatedOrder = await this.prismaService.order.update({
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
      return updatedOrder
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw OrderNotFoundException
      }
      throw error
    }
  }
}
