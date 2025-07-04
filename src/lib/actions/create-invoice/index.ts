"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { Role } from "@prisma/client";

import { createInvoiceSchema } from "@/lib/actions/create-invoice/schema";
import { InputType, ReturnType } from "@/lib/actions/create-invoice/types";
import { createAction } from "@/lib/create-action";
import db from "@/lib/prisma";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth();
  if (!session?.user && session?.user.role !== Role.ADMIN)
    return { error: "Unauthorized." };

  const {
    discountPercentage,
    items,
    shipping,
    subtotal,
    total,
    totalCC,
    invoiceNumber,
    exchangeRate,
  } = data;

  let invoice;

  try {
    invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        userId: session.user.id,
        subtotal,
        shipping,
        total,
        totalCC,
        exchangeRate,
        discountPercent: discountPercentage,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            offerEnabled: item.freeQuantity > 0,
            offerQuantity: item.freeQuantity,
            unitPrice: item.unitPrice,
            totalPrice: item.subtotal,
          })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  } catch (e) {
    const error = e as Error;
    return { error: error.message || "Failed to create invoice" };
  }

  revalidatePath(`/admin`);

  return {
    data: invoice,
    message: "Invoice created successfully.",
  };
};

export const createInvoice = createAction(createInvoiceSchema, handler);
