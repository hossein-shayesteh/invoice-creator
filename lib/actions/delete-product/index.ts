"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { Role } from "@prisma/client";

import { deleteProductSchema } from "@/lib/actions/delete-product/schema";
import { InputType, ReturnType } from "@/lib/actions/delete-product/types";
import { createAction } from "@/lib/create-action";
import db from "@/lib/prisma";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN)
    return { error: "دسترسی غیرمجاز" };

  const { id } = data;

  try {
    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new Error(`محصول یافت نشد`);
    }

    // Delete product
    await db.product.delete({
      where: { id },
    });
  } catch (e) {
    const error = e as Error;
    return { error: error.message || "خطا در حذف محصول" };
  }

  revalidatePath(`/admin`);

  return {
    message: "مصحول با موفقیت حذف شد",
  };
};

export const deleteProduct = createAction(deleteProductSchema, handler);
