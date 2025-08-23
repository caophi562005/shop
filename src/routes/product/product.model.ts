import { OrderBy, SortBy } from 'src/shared/constants/other.constant'
import { PaginationQuerySchema } from 'src/shared/models/request.model'
import { CategoryIncludeTranslationSchema } from 'src/shared/models/shared-category.model'
import { ProductTranslationSchema } from 'src/shared/models/shared-product-translation.model'
import { ProductSchema } from 'src/shared/models/shared-product.model'
import { SKUSchema } from 'src/shared/models/shared-sku.model'
import { z } from 'zod'
import { UpsertSKUBodySchema } from './sku.model'

function generateSKUs(variants: any[]): any[] {
  function getCombinations(arrays: string[][]): string[] {
    return arrays.reduce((acc, curr) => acc.flatMap((x) => curr.map((y) => `${x}${x ? '-' : ''}${y}`)), [''])
  }

  const options = variants.map((variant) => variant.options)

  const combinations = getCombinations(options)

  return combinations.map((value) => ({
    value,
    price: 0,
    stock: 100,
    image: '',
  }))
}

//Dành cho client và guest
export const GetProductsQuerySchema = PaginationQuerySchema.extend({
  name: z.string().optional(),

  categories: z
    .preprocess((value) => {
      if (typeof value === 'string') {
        return [Number(value)]
      }
      return value
    }, z.array(z.coerce.number().int().positive()))
    .optional(),

  minPrice: z.coerce.number().int().positive().optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  createdById: z.coerce.number().int().positive().optional(),
  orderBy: z.enum([OrderBy.Asc, OrderBy.Desc]).default(OrderBy.Desc),
  sortBy: z.enum([SortBy.Price, SortBy.CreatedAt, SortBy.Sale]).default(SortBy.CreatedAt),
})

//Dành cho admin và guest
export const GetManageProductsQuerySchema = GetProductsQuerySchema.extend({
  isPublic: z.preprocess((value) => value === 'true', z.boolean()).optional(),
})

//Dành cho lấy products đang giảm giá (basePrice < virtualPrice)
export const GetDiscountedProductsQuerySchema = PaginationQuerySchema.extend({
  name: z.string().optional(),
  categories: z
    .preprocess((value) => {
      if (typeof value === 'string') {
        return [Number(value)]
      }
      return value
    }, z.array(z.coerce.number().int().positive()))
    .optional(),
  orderBy: z.enum([OrderBy.Asc, OrderBy.Desc]).default(OrderBy.Desc),
  sortBy: z.enum([SortBy.Price, SortBy.CreatedAt, SortBy.Sale]).default(SortBy.CreatedAt),
})

export const GetProductsResSchema = z.object({
  data: z.array(
    ProductSchema.extend({
      productTranslations: z.array(ProductTranslationSchema),
      categories: z.array(
        z.object({
          id: z.number(),
        }),
      ),
    }),
  ),
  page: z.number(),
  limit: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
})

export const GetProductsParamsSchema = z
  .object({
    productId: z.coerce.number().int().positive(),
  })
  .strict()

export const CreateProductBodySchema = ProductSchema.pick({
  publishedAt: true,
  name: true,
  basePrice: true,
  virtualPrice: true,
  images: true,
  variants: true,
})
  .extend({
    categories: z.array(z.coerce.number().int().positive()),
    skus: z.array(UpsertSKUBodySchema),
  })
  .strict()
  .superRefine(({ variants, skus }, ctx) => {
    //Kiểm tra xem số lượng SKU có hợp lệ không
    const skuValueArray = generateSKUs(variants)
    if (skus.length !== skuValueArray.length) {
      return ctx.addIssue({
        code: 'custom',
        message: `Số lượng SKU không hợp lệ`,
        path: ['skus'],
      })
    }

    // Kiểm tra từng SKU có hợp lệ không
    let wrongSKUIndex = -1
    const isValidSKUs = skus.every((sku, index) => {
      const isValid = sku.value === skuValueArray[index].value
      if (!isValid) {
        wrongSKUIndex = index
      }
      return isValid
    })
    if (!isValidSKUs) {
      ctx.addIssue({
        code: 'custom',
        message: `Giá trị SKU index ${wrongSKUIndex} không hợp lệ`,
        path: ['skus'],
      })
    }
  })

export const updateProductBodySchema = CreateProductBodySchema

export type GetProductsResType = z.infer<typeof GetProductsResSchema>
export type GetProductsParamsType = z.infer<typeof GetProductsParamsSchema>
export type CreateProductBodyType = z.infer<typeof CreateProductBodySchema>
export type UpdateProductBodyType = z.infer<typeof updateProductBodySchema>
export type GetManageProductsQueryType = z.infer<typeof GetManageProductsQuerySchema>
export type GetProductsQueryType = z.infer<typeof GetProductsQuerySchema>
export type GetDiscountedProductsQueryType = z.infer<typeof GetDiscountedProductsQuerySchema>
