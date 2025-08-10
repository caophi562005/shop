import { z } from "zod";
import { UserSchema } from "./shared/shared-user.model";
import { RoleSchema } from "./shared/shared-role.model";
export const GetUsersResSchema = z.object({
  data: z.array(
    UserSchema.omit({
      password: true,
      totpSecret: true,
    }).extend({
      phoneNumber: z.string().nullable(),
      role: RoleSchema.pick({
        id: true,
        name: true,
      }),
    })
  ),
  page: z.number(),
  limit: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
});

export const UserDetail = UserSchema.omit({
  password: true,
  totpSecret: true,
}).extend({
  phoneNumber: z.string().nullable(),
  role: RoleSchema.pick({
    id: true,
    name: true,
  }),
});

export const GetUserParamsSchema = z
  .object({
    userId: z.coerce.number().int().positive(),
  })
  .strict();

export const CreateUserBodySchema = UserSchema.pick({
  email: true,
  name: true,
  phoneNumber: true,
  avatar: true,
  status: true,
  password: true,
  roleId: true,
});

export const UpdateUserBodySchema = CreateUserBodySchema;

export type GetUsersResType = z.infer<typeof GetUsersResSchema>;
export type UserDetailType = z.infer<typeof UserDetail>;
export type GetUserParamsType = z.infer<typeof GetUserParamsSchema>;
export type CreateUserBodyType = z.infer<typeof CreateUserBodySchema>;
export type UpdateUserBodyType = z.infer<typeof UpdateUserBodySchema>;
