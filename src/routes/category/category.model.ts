import { CategoryIncludeTranslationSchema, CategorySchema } from 'src/shared/models/shared-category.model'
import { z } from 'zod'

export const GetCategoriesResSchema = z.object({
  data: z.array(CategorySchema),
})

export const GetCategoriesQuerySchema = z
  .object({
    parentCategoryId: z.coerce.number().int().positive().optional(),
  })
  .strict()

export const GetCategoryParamsSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
})

export const GetChildrenCategoriesIdSchema = z.object({
  parentCategoryId: z.coerce.number().int().positive(),
})

export const GetCategoryDetailResSchema = CategoryIncludeTranslationSchema

export const CreateCategoryBodySchema = CategorySchema.pick({
  name: true,
  logo: true,
  parentCategoryId: true,
}).strict()

export const UpdateCategoryBodySchema = CreateCategoryBodySchema

export type GetCategoriesResType = z.infer<typeof GetCategoriesResSchema>
export type GetCategoriesQueryType = z.infer<typeof GetCategoriesQuerySchema>
export type GetCategoryParamsType = z.infer<typeof GetCategoryParamsSchema>
export type GetCategoryDetailResType = z.infer<typeof GetCategoryDetailResSchema>
export type CreateCategoryBodyType = z.infer<typeof CreateCategoryBodySchema>
export type UpdateCategoryBodyType = z.infer<typeof UpdateCategoryBodySchema>
