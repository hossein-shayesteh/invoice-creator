import { z } from "zod";

export const createInvoiceSchema = z.object({
  invoiceNumber: z.string(),
  subtotal: z.number(),
  shipping: z.number(),
  discount: z.number(),
  total: z.number(),
  totalCC: z.number(),
  exchangeRate: z.number(),
  discountPercentage: z.number(),
  items: z.array(
    z.object({
      productId: z.string(),
      productName: z.string(),
      productCode: z.string(),
      quantity: z.number(),
      freeQuantity: z.number(),
      unitPrice: z.number(),
      ccPoints: z.number(),
      shipment: z.number(),
      subtotal: z.number(),
    }),
  ),
});
