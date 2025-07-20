import { z } from "zod";

export const updateProductSchema = z.object({
  id: z.string(),
  isAvailable: z.boolean().optional(),
  cc: z.string().optional(),
  code: z.string().optional(),
  price: z.string().optional(),
  product_name: z.string().optional(),
});
