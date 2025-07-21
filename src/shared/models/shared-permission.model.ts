import { HTTPMethod } from '@prisma/client';
import { z } from 'zod';

export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  module: z.string(),
  path: z.string(),
  method: z.enum([
    HTTPMethod.GET,
    HTTPMethod.POST,
    HTTPMethod.PUT,
    HTTPMethod.DELETE,
    HTTPMethod.PATCH,
    HTTPMethod.OPTIONS,
    HTTPMethod.HEAD,
  ]),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PermissionType = z.infer<typeof PermissionSchema>;
