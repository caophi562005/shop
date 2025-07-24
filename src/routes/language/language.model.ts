import { z } from 'zod'

export const LanguageSchema = z.object({
  id: z.string().max(5),
  name: z.string(),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const GetLanguageResSchema = z.object({
  data: z.array(LanguageSchema),
  totalItems: z.number(),
})

export const GetLanguageParamsSchema = z
  .object({
    languageId: z.string().max(5),
  })
  .strict()

export const GetLanguageDetailSchema = LanguageSchema

export const CreateLanguageBodySchema = LanguageSchema.pick({
  id: true,
  name: true,
}).strict()

export const UpdateLanguageBodySchema = LanguageSchema.pick({
  name: true,
}).strict()

export type LanguageType = z.infer<typeof LanguageSchema>
export type GetLanguageResType = z.infer<typeof GetLanguageResSchema>
export type GetLanguageParamsType = z.infer<typeof GetLanguageParamsSchema>
export type GetLanguageDetailType = z.infer<typeof GetLanguageDetailSchema>
export type CreateLanguageBodyType = z.infer<typeof CreateLanguageBodySchema>
export type UpdateLanguageBodyType = z.infer<typeof UpdateLanguageBodySchema>
