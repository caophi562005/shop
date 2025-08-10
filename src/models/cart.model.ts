import { z } from "zod";
import { SKUSchema } from "./shared/shared-sku.model";
import { ProductSchema } from "./shared/shared-product.model";
import { ProductTranslationSchema } from "./shared/shared-product-translation.model";

export const CartItemSchema = z.object({
  id: z.number(),
  quantity: z.number().int().positive(),
  skuId: z.number(),
  userId: z.number(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetCartItemParamsSchema = z.object({
  cartItemId: z.coerce.number().int().positive(),
});

export const CartItemDetailResSchema = z.array(
  CartItemSchema.extend({
    sku: SKUSchema.pick({
      id: true,
      value: true,
      price: true,
      stock: true,
      image: true,
    }).extend({
      product: ProductSchema.pick({
        id: true,
        name: true,
        images: true,
      }).extend({
        productTranslations: z.array(ProductTranslationSchema),
      }),
    }),
  })
);

export const GetCartResSchema = z.object({
  data: CartItemDetailResSchema,
  page: z.number(),
  limit: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
});

export const AddToCartBodySchema = CartItemSchema.pick({
  skuId: true,
  quantity: true,
}).strict();

export const UpdateCartItemBodySchema = AddToCartBodySchema;

export const DeleteCartBodySchema = z
  .object({
    cartItemIds: z.array(z.number().int().positive()),
  })
  .strict();

export type CartItemType = z.infer<typeof CartItemSchema>;
export type GetCartItemParamsType = z.infer<typeof GetCartItemParamsSchema>;
export type CartItemDetailResType = z.infer<typeof CartItemDetailResSchema>;
export type GetCartResType = z.infer<typeof GetCartResSchema>;
export type AddToCartBodyType = z.infer<typeof AddToCartBodySchema>;
export type UpdateCartItemBodyType = z.infer<typeof UpdateCartItemBodySchema>;
export type DeleteCartBodyType = z.infer<typeof DeleteCartBodySchema>;
