import { RoleSchema, RoleWithPermissionsSchema } from 'src/shared/models/shared-role.model'
import { z } from 'zod'

export const GetRolesResSchema = z.object({
  data: z.array(RoleSchema),
  page: z.number(),
  limit: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
})

export const GetRoleParamsSchema = z
  .object({
    roleId: z.coerce.number().int().positive(),
  })
  .strict()

export const GetRoleDetailResSchema = RoleWithPermissionsSchema

export const CreateRoleBodySchema = RoleSchema.pick({
  name: true,
  description: true,
  isActive: true,
}).strict()

export const CreateRoleResSchema = RoleSchema

export const UpdateRoleBodySchema = RoleSchema.pick({
  name: true,
  description: true,
  isActive: true,
})
  .extend({
    permissions: z.array(z.number()).optional(),
  })
  .strict()

export const UpdateRoleResSchema = RoleSchema

export type GetRolesResType = z.infer<typeof GetRolesResSchema>
export type GetRoleDetailResType = z.infer<typeof GetRoleDetailResSchema>
export type GetRoleParamsType = z.infer<typeof GetRoleParamsSchema>
export type CreateRoleBodyType = z.infer<typeof CreateRoleBodySchema>
export type CreateRoleResType = z.infer<typeof CreateRoleResSchema>
export type UpdateRoleBodyType = z.infer<typeof UpdateRoleBodySchema>
export type UpdateRoleResType = z.infer<typeof UpdateRoleResSchema>
