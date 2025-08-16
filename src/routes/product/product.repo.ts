import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateProductBodyType,
  GetDiscountedProductsQueryType,
  GetProductDetailResType,
  GetProductsQueryType,
  GetProductsResType,
  UpdateProductBodyType,
} from './product.model'
import { Prisma } from '@prisma/client'
import { ALL_LANGUAGE_CODE, SortBy } from 'src/shared/constants/other.constant'
import { ProductType } from 'src/shared/models/shared-product.model'

@Injectable()
export class ProductRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list({
    query,
    isPublish,
    languageId,
  }: {
    query: GetProductsQueryType
    isPublish?: boolean
    languageId: string
  }): Promise<GetProductsResType> {
    const skip = (query.page - 1) * query.limit
    const take = query.limit
    let where: Prisma.ProductWhereInput = {
      deletedAt: null,
      createdById: query.createdById ? query.createdById : undefined,
    }

    if (isPublish === true) {
      where.publishedAt = {
        lte: new Date(),
        not: null,
      }
    } else if (isPublish === false) {
      where = {
        ...where,
        OR: [{ publishedAt: null }, { publishedAt: { gt: new Date() } }],
      }
    }

    if (query.name) {
      where.name = {
        contains: query.name,
        mode: 'insensitive',
      }
    }

    if (query.categories && query.categories.length > 0) {
      where.categories = {
        some: {
          id: {
            in: query.categories,
          },
        },
      }
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.basePrice = {
        gte: query.minPrice,
        lte: query.maxPrice,
      }
    }

    // Mắc định sort theo createdAt mới nhất
    let calculatedOrderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = {
      createdAt: query.orderBy,
    }

    if (query.sortBy === SortBy.Price) {
      calculatedOrderBy = {
        basePrice: query.orderBy,
      }
    } else if (query.sortBy === SortBy.Sale) {
      calculatedOrderBy = {
        orders: {
          _count: query.orderBy,
        },
      }
    }

    const [totalItems, data] = await Promise.all([
      this.prismaService.product.count({
        where,
      }),
      this.prismaService.product.findMany({
        where,
        include: {
          productTranslations: {
            where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { languageId: languageId, deletedAt: null },
          },
          categories: {
            where: {
              deletedAt: null,
            },
            select: {
              id: true,
            },
          },
        },
        orderBy: calculatedOrderBy,
        skip,
        take,
      }),
    ])
    return {
      data,
      totalItems,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(totalItems / query.limit),
    }
  }

  getDetail({
    productId,
    languageId,
    isPublish,
  }: {
    productId: number
    languageId: string
    isPublish?: boolean
  }): Promise<GetProductDetailResType | null> {
    let where: Prisma.ProductWhereUniqueInput = {
      id: productId,
      deletedAt: null,
    }

    if (isPublish === true) {
      where.publishedAt = {
        lte: new Date(),
        not: null,
      }
    } else if (isPublish === false) {
      where = {
        ...where,
        OR: [{ publishedAt: null }, { publishedAt: { gt: new Date() } }],
      }
    }
    return this.prismaService.product.findUnique({
      where,
      include: {
        productTranslations: {
          where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { languageId: languageId, deletedAt: null },
        },
        skus: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            id: 'asc', // Order by creation order để giữ thứ tự logic combinations
          },
        },
        categories: {
          where: {
            deletedAt: null,
          },
          include: {
            categoryTranslations: {
              where:
                languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { languageId: languageId, deletedAt: null },
            },
          },
        },
      },
    })
  }

  findById(productId: number): Promise<ProductType | null> {
    return this.prismaService.product.findUnique({
      where: {
        id: productId,
        deletedAt: null,
      },
    })
  }

  create({
    createdById,
    data,
  }: {
    createdById: number
    data: CreateProductBodyType
  }): Promise<GetProductDetailResType> {
    const { skus, categories, ...productData } = data
    return this.prismaService.product.create({
      data: {
        ...productData,
        createdById,
        categories: {
          connect: categories.map((category) => ({ id: category })),
        },
        skus: {
          createMany: {
            data: skus.map((sku) => ({
              ...sku,
              createdById,
            })),
          },
        },
      },
      include: {
        productTranslations: {
          where: {
            deletedAt: null,
          },
        },
        categories: {
          where: {
            deletedAt: null,
          },
          include: {
            categoryTranslations: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
        skus: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            id: 'asc', // Order by creation order để giữ thứ tự logic combinations
          },
        },
      },
    })
  }

  async update({
    productId,
    updatedById,
    data,
  }: {
    productId: number
    updatedById: number
    data: UpdateProductBodyType
  }): Promise<ProductType> {
    const { skus: dataSkus, categories, ...productData } = data
    //SKU tồn tại trong DB nhưng không có trong data payload thì sẽ bị xoá

    //Lấy danh sách SKU hiện tại trong DB
    const existingSkus = await this.prismaService.sKU.findMany({
      where: {
        productId,
        deletedAt: null,
      },
    })

    //Tìm các SKU cần xoá ( tồn tại trong DB nhưng không có trong data payload)
    const skusToDelete = existingSkus.filter((sku) => dataSkus.every((dataSku) => dataSku.value !== sku.value))
    const skuIdsToDelete = skusToDelete.map((sku) => sku.id)

    // Đưa các ID của sku tồn tại trong DB vào data payload
    const skuWithId = dataSkus.map((dataSku) => {
      const existingSku = existingSkus.find((eSkus) => eSkus.value === dataSku.value)
      return {
        ...dataSku,
        id: existingSku ? existingSku.id : null,
      }
    })

    // Tìm các Sku để cập nhập
    const skusToUpdate = skuWithId.filter((dataSku) => dataSku.id !== null)

    // Tìm các Sku cần thêm mới
    const skusToCreate = skuWithId
      .filter((dataSku) => dataSku.id === null)
      .map((sku) => {
        // Tách id khỏi sku
        const { id: skuId, ...data } = sku
        return {
          ...data,
          productId,
          createdById: updatedById,
        }
      })

    const [product] = await this.prismaService.$transaction([
      // Cập nhập product
      this.prismaService.product.update({
        where: {
          id: productId,
          deletedAt: null,
        },
        data: {
          ...productData,
          updatedById,
          categories: {
            set: categories.map((id) => ({ id })), // Ghi đè toàn bộ
          },
        },
      }),

      // Xoá mềm các SKU không có trong data payload
      this.prismaService.sKU.updateMany({
        where: {
          id: {
            in: skuIdsToDelete,
          },
        },
        data: {
          deletedById: updatedById,
          deletedAt: new Date(),
        },
      }),

      // Cập nhập các SKU
      ...skusToUpdate.map((sku) => {
        return this.prismaService.sKU.update({
          where: {
            id: sku.id as number,
          },
          data: {
            value: sku.value,
            price: sku.price,
            stock: sku.stock,
            image: sku.image,
            updatedById,
          },
        })
      }),

      // Thêm mới SKU
      this.prismaService.sKU.createMany({
        data: skusToCreate,
      }),
    ])

    return product
  }

  async delete(
    { productId, deletedById }: { productId: number; deletedById: number },
    isHard?: boolean,
  ): Promise<ProductType> {
    if (isHard) {
      return this.prismaService.product.delete({
        where: {
          id: productId,
        },
      })
    } else {
      const [product] = await Promise.all([
        this.prismaService.product.update({
          where: {
            id: productId,
            deletedAt: null,
          },
          data: {
            deletedById,
            deletedAt: new Date(),
          },
        }),
        this.prismaService.productTranslation.updateMany({
          where: {
            productId,
            deletedAt: null,
          },
          data: {
            deletedById,
            deletedAt: new Date(),
          },
        }),
        this.prismaService.sKU.updateMany({
          where: {
            productId,
            deletedAt: null,
          },
          data: {
            deletedById,
            deletedAt: new Date(),
          },
        }),
      ])
      return product
    }
  }

  async getDiscountedProducts({
    query,
    languageId,
  }: {
    query: GetDiscountedProductsQueryType
    languageId: string
  }): Promise<GetProductsResType> {
    const skip = (query.page - 1) * query.limit
    const take = query.limit

    // Điều kiện cơ bản cho products đang giảm giá
    let where: Prisma.ProductWhereInput = {
      deletedAt: null,
      // Chỉ lấy products đã publish
      publishedAt: {
        lte: new Date(),
        not: null,
      },
      // Workaround: Filter products có virtualPrice > basePrice
      AND: [
        {
          basePrice: {
            not: undefined,
          },
        },
        {
          virtualPrice: {
            not: undefined,
          },
        },
      ],
    }

    // Filter theo tên
    if (query.name) {
      where.name = {
        contains: query.name,
        mode: 'insensitive',
      }
    }

    // Filter theo categories
    if (query.categories && query.categories.length > 0) {
      where.categories = {
        some: {
          id: {
            in: query.categories,
          },
        },
      }
    }

    // Sorting
    let calculatedOrderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = {
      createdAt: query.orderBy,
    }

    if (query.sortBy === SortBy.Price) {
      calculatedOrderBy = {
        basePrice: query.orderBy,
      }
    } else if (query.sortBy === SortBy.Sale) {
      calculatedOrderBy = {
        orders: {
          _count: query.orderBy,
        },
      }
    }

    // Lấy tất cả products trước, sau đó filter trong memory
    const allProducts = await this.prismaService.product.findMany({
      where,
      include: {
        productTranslations: {
          where: {
            languageId: languageId === ALL_LANGUAGE_CODE ? undefined : languageId,
          },
        },
        categories: {
          include: {
            categoryTranslations: {
              where: {
                languageId: languageId === ALL_LANGUAGE_CODE ? undefined : languageId,
              },
            },
          },
        },
      },
      orderBy: calculatedOrderBy,
    })

    // Filter products có basePrice < virtualPrice
    const discountedProducts = allProducts.filter((product) => product.basePrice < product.virtualPrice)

    // Apply pagination
    const totalItems = discountedProducts.length
    const data = discountedProducts.slice(skip, skip + take)

    return {
      data,
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / query.limit),
    }
  }
}
