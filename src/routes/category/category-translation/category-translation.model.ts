import { CategoryTranslationSchema } from 'src/shared/models/shared-category-translation.model'
import { z } from 'zod'

export const GetCategoryTranslationParamsSchema = z
  .object({
    categoryTranslationId: z.coerce.number().int().positive(),
  })
  .strict()

export const GetCategoryTranslationDetailResSchema = CategoryTranslationSchema

export const CreateCategoryTranslationBodySchema = CategoryTranslationSchema.pick({
  name: true,
  description: true,
  languageId: true,
  categoryId: true,
}).strict()

export const UpdateCategoryTranslationBodySchema = CreateCategoryTranslationBodySchema

export type GetCategoryTranslationParamsType = z.infer<typeof GetCategoryTranslationParamsSchema>
export type GetCategoryTranslationDetailResType = z.infer<typeof GetCategoryTranslationDetailResSchema>
export type CreateCategoryTranslationBodyType = z.infer<typeof CreateCategoryTranslationBodySchema>
export type UpdateCategoryTranslationBodyType = z.infer<typeof UpdateCategoryTranslationBodySchema>
