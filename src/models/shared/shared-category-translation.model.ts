import { string, z } from 'zod'

export const CategoryTranslationSchema = z.object({
  id: z.number(),
  name: string(),
  description: z.string(),
  languageId: z.string(),
  categoryId: z.number(),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

export type CategoryTranslationType = z.infer<typeof CategoryTranslationSchema>
