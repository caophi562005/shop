import { z } from 'zod'
import { CategoryTranslationSchema } from './shared-category-translation.model'

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  logo: z.string(),
  parentCategoryId: z.number().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

export const CategoryIncludeTranslationSchema = CategorySchema.extend({
  categoryTranslations: z.array(CategoryTranslationSchema),
})

export type CategoryType = z.infer<typeof CategorySchema>
export type CategoryIncludeTranslationType = z.infer<typeof CategoryIncludeTranslationSchema>
