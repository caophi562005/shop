import { z } from "zod";
import { SKUSchema } from "./shared/shared-sku.model";

export const UpsertSKUBodySchema = SKUSchema.pick({
  value: true,
  price: true,
  stock: true,
  image: true,
}).strict();

export type UpsertSKUType = z.infer<typeof UpsertSKUBodySchema>;
