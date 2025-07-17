"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { Role } from "@prisma/client";

import { createProductSchema } from "@/lib/actions/create-product/schema";
import { InputType, ReturnType } from "@/lib/actions/create-product/types";
import { createAction } from "@/lib/create-action";
import db from "@/lib/prisma";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth();
  if (!session?.user && session?.user.role !== Role.ADMIN)
    return { error: "Unauthorized." };

  const { code, product_name, cc, price } = data;

  let product;

  try {
    // Check if product with this code already exists
    const existingProduct = await db.product.findUnique({
      where: { code },
    });

    if (existingProduct) {
      throw new Error(`Product with code "${code}" already exists`);
    }

    // Create new product
    product = await db.product.create({
      data: {
        code,
        product_name,
        cc: parseFloat(cc) || 0,
        price: parseFloat(price) || 0,
        shipment: 0,
      },
    });
  } catch (e) {
    const error = e as Error;
    return { error: error.message || "Failed to create product" };
  }

  revalidatePath(`/admin`);

  return {
    data: product,
    message: "Product created successfully.",
  };
};

export const createProduct = createAction(createProductSchema, handler);
