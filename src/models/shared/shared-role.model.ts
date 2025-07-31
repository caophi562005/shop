import { z } from 'zod';
import { PermissionSchema } from './shared-permission.model';

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean().default(true),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RoleWithPermissionsSchema = RoleSchema.extend({
  permissions: z.array(PermissionSchema),
});

export type RoleType = z.infer<typeof RoleSchema>;
export type RoleWithPermissionsType = z.infer<typeof RoleWithPermissionsSchema>;
