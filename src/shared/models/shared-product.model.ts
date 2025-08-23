import { z } from 'zod'
import { ProductTranslationSchema } from './shared-product-translation.model'
import { SKUSchema } from './shared-sku.model'
import { CategoryIncludeTranslationSchema } from './shared-category.model'

export const VariantSchema = z.object({
  value: z.string(),
  options: z.array(z.string()),
})

export const VariantsSchema = z.array(VariantSchema).superRefine((variants, ctx) => {
  // Kiểm tra variants và variant option có bị trùng không
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i]
    const isExistingVariant = variants.findIndex((v) => v.value.toLowerCase() === variant.value.toLowerCase()) !== i
    if (isExistingVariant) {
      return ctx.addIssue({
        code: 'custom',
        message: `Giá trị ${variant.value} đã tồn tại trong danh sách variants`,
        path: ['variants'],
      })
    }

    const isDifferentOption = variant.options.some((option, index) => {
      const isExistingOption = variant.options.findIndex((o) => o.toLowerCase() === option.toLowerCase()) !== index
      return isExistingOption
    })

    if (isDifferentOption) {
      return ctx.addIssue({
        code: 'custom',
        message: `Variant ${variant.value} chứa các option trùng`,
        path: ['variants'],
      })
    }
  }
})

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  basePrice: z.number().min(0),
  virtualPrice: z.number().min(0),
  publishedAt: z.coerce.date().nullable(),
  images: z.array(z.string()),
  variants: VariantsSchema,

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

export const GetProductDetailResSchema = ProductSchema.extend({
  productTranslations: z.array(ProductTranslationSchema),
  skus: z.array(SKUSchema),
  categories: z.array(CategoryIncludeTranslationSchema),
})

export type ProductType = z.infer<typeof ProductSchema>
export type GetProductDetailResType = z.infer<typeof GetProductDetailResSchema>
export type VariantsType = z.infer<typeof VariantsSchema>
