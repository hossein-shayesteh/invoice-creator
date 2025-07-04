"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { Role } from "@prisma/client";

import { deleteInvoiceSchema } from "@/lib/actions/delete-invoice/schema";
import { InputType, ReturnType } from "@/lib/actions/delete-invoice/types";
import { createAction } from "@/lib/create-action";
import db from "@/lib/prisma";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth();
  if (!session?.user && session?.user.role !== Role.ADMIN)
    return { error: "Unauthorized: Admin access required" };

  const { id } = data;

  try {
    // Check if invoice exists
    const existingInvoice = await db.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      throw new Error("Invoice not found");
    }

    // Delete invoice (cascade will delete invoice items)
    await db.invoice.delete({
      where: { id },
    });
  } catch (e) {
    const error = e as Error;
    return { error: error.message };
  }

  revalidatePath(`/admin`);

  return {
    message: "Invoice deleted successfully",
  };
};

export const deleteInvoice = createAction(deleteInvoiceSchema, handler);
