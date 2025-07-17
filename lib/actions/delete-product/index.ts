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
  if (!session?.user && session?.user.role !== Role.ADMIN)
    return { error: "Unauthorized: Admin access required" };

  const { id } = data;

  try {
    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new Error(`Product not found`);
    }

    // Delete product
    await db.product.delete({
      where: { id },
    });
  } catch (e) {
    const error = e as Error;
    return { error: error.message || "Failed to delete product" };
  }

  revalidatePath(`/admin`);

  return {
    message: "Product deleted successfully",
  };
};

export const deleteProduct = createAction(deleteProductSchema, handler);
