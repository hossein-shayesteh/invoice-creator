"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { Role } from "@prisma/client";

import { updateProductSchema } from "@/lib/actions/update-product/schema";
import { InputType, ReturnType } from "@/lib/actions/update-product/types";
import { createAction } from "@/lib/create-action";
import db from "@/lib/prisma";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN)
    return { error: "دسترسی غیرمجاز" };

  const { id, code, product_name, cc, price, isAvailable } = data;

  let product;

  try {
    // Check if product with this id already exists
    const existingProduct = await db.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new Error("محصول یافت نشد");
    }

    // If code is being changed, check if the new code already exists
    if (code && code !== existingProduct.code) {
      const productWithCode = await db.product.findUnique({
        where: { code },
      });

      if (productWithCode)
        throw new Error(`مصحول با کد "${code}" از قبل موجود است`);
    }

    // Update product
    product = await db.product.update({
      where: { id },
      data: {
        code,
        product_name,
        isAvailable,
        cc: cc ? parseFloat(cc) : undefined,
        price: price ? parseFloat(price) : undefined,
      },
    });
  } catch (e) {
    const error = e as Error;
    return { error: error.message || "خطا در آپدیت محصول" };
  }

  revalidatePath(`/admin`);
  revalidatePath(`/dashboard`);

  return {
    data: product,
    message: "محصول با موفقیت آپدیت شد",
  };
};

export const updateProduct = createAction(updateProductSchema, handler);
