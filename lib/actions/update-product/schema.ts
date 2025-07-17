import { z } from "zod";

export const updateProductSchema = z.object({
  id: z.string(),
  code: z.string(),
  product_name: z.string(),
  cc: z.string(),
  price: z.string(),
});
