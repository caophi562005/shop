import { Injectable } from '@nestjs/common'
import { SKUType } from 'src/shared/models/shared-sku.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  InvalidQuantityException,
  NotFoundCartItemException,
  NotFoundSKUException,
  OutOfStockSKUException,
  ProductNotFoundException,
} from './cart.error'
import {
  AddToCartBodyType,
  CartItemDetailResType,
  CartItemType,
  DeleteCartBodyType,
  GetCartResType,
  UpdateCartItemBodyType,
} from './cart.model'
import { ALL_LANGUAGE_CODE } from 'src/shared/constants/other.constant'
import { PaginationQueryType } from 'src/shared/models/request.model'

@Injectable()
export class CartRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private async validateSKU({
    skuId,
    quantity,
    userId,
    isCreate,
  }: {
    skuId: number
    quantity: number
    userId: number
    isCreate: boolean
  }): Promise<SKUType> {
    const [cartItem, sku] = await Promise.all([
      this.prismaService.cartItem.findUnique({
        where: {
          userId_skuId: {
            userId,
            skuId,
          },
        },
      }),
      this.prismaService.sKU.findUnique({
        where: {
          id: skuId,
          deletedAt: null,
        },
        include: {
          product: true,
        },
      }),
    ])

    // Kiểm tra tồn tại của SKU
    if (!sku) {
      throw NotFoundSKUException
    }

    // Kiểm tra hàng tồn
    if (sku.stock < 1 || sku.stock < quantity) {
      throw OutOfStockSKUException
    }

    // Kiểm tra số lượng khi thêm mới hoặc cập nhật
    if (isCreate && cartItem && quantity + cartItem.quantity > sku.stock) {
      throw InvalidQuantityException
    } else if (!isCreate && cartItem && quantity > sku.stock) {
      throw InvalidQuantityException
    }

    // Nếu thêm mới và không có cartItem, bỏ qua kiểm tra cartItem
    if (!isCreate && !cartItem) {
      throw NotFoundCartItemException
    }

    const { product } = sku

    //Kiểm tra xem sản phẩm bị xoá hay có publish không
    if (
      product.deletedAt !== null ||
      product.publishedAt === null ||
      (product.publishedAt !== null && product.publishedAt > new Date())
    ) {
      throw ProductNotFoundException
    }

    return sku
  }

  async list({
    pagination,
    userId,
    languageId,
  }: {
    pagination: PaginationQueryType
    userId: number
    languageId: string
  }): Promise<GetCartResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit

    const [totalItems, cartItems] = await Promise.all([
      this.prismaService.cartItem.count({
        where: {
          userId,
          sku: {
            product: {
              deletedAt: null,
              publishedAt: {
                lte: new Date(),
                not: null,
              },
            },
          },
        },
      }),
      this.prismaService.cartItem.findMany({
        where: {
          userId,
          sku: {
            product: {
              deletedAt: null,
              publishedAt: {
                lte: new Date(),
                not: null,
              },
            },
          },
        },
        include: {
          sku: {
            include: {
              product: {
                include: {
                  productTranslations: {
                    where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { languageId, deletedAt: null },
                  },
                  createdBy: true,
                },
              },
            },
          },
        },
        skip,
        take,
        orderBy: {
          updatedAt: 'desc',
        },
      }),
    ])

    return {
      data: cartItems,
      page: pagination.page,
      limit: pagination.limit,
      totalItems: totalItems,
      totalPages: Math.ceil(totalItems / pagination.limit),
    }
  }

  async create(userId: number, body: AddToCartBodyType): Promise<CartItemType> {
    await this.validateSKU({
      skuId: body.skuId,
      quantity: body.quantity,
      userId,
      isCreate: true,
    })
    return this.prismaService.cartItem.upsert({
      where: {
        userId_skuId: {
          userId,
          skuId: body.skuId,
        },
      },
      update: {
        quantity: {
          increment: body.quantity,
        },
      },
      create: {
        userId,
        ...body,
      },
    })
  }

  async update({
    cartItemId,
    body,
    userId,
  }: {
    cartItemId: number
    body: UpdateCartItemBodyType
    userId: number
  }): Promise<CartItemType> {
    await this.validateSKU({
      skuId: body.skuId,
      quantity: body.quantity,
      userId,
      isCreate: false,
    })

    return this.prismaService.cartItem.update({
      where: {
        id: cartItemId,
        userId,
      },
      data: body,
    })
  }

  delete(userId: number, body: DeleteCartBodyType): Promise<{ count: number }> {
    return this.prismaService.cartItem.deleteMany({
      where: {
        id: {
          in: body.cartItemIds,
        },
        userId,
      },
    })
  }
}
