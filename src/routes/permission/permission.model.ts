import { PermissionSchema } from 'src/shared/models/shared-permission.model'
import { z } from 'zod'

export const GetPermissionsResSchema = z.object({
  data: z.array(PermissionSchema),
  page: z.number(),
  limit: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
})

export const GetPermissionParamsSchema = z
  .object({
    permissionId: z.coerce.number().int().positive().int().positive().int().positive(),
  })
  .strict()

export const GetPermissionDetailResSchema = PermissionSchema

export const CreatePermissionBodySchema = PermissionSchema.pick({
  name: true,
  path: true,
  method: true,
  module: true,
})

export const UpdatePermissionBodySchema = CreatePermissionBodySchema

export type GetPermissionsResType = z.infer<typeof GetPermissionsResSchema>
export type GetPermissionParamsType = z.infer<typeof GetPermissionParamsSchema>
export type GetPermissionDetailResType = z.infer<typeof GetPermissionDetailResSchema>
export type CreatePermissionBodyType = z.infer<typeof CreatePermissionBodySchema>
export type UpdatePermissionBodyType = z.infer<typeof UpdatePermissionBodySchema>
