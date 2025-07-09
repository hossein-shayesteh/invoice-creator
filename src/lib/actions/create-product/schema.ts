import { z } from "zod";

export const createProductSchema = z.object({
  code: z.string(),
  product_name: z.string(),
  cc: z.string(),
  price: z.string(),
});
