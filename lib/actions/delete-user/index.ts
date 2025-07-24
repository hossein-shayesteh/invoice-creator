"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { Role } from "@prisma/client";

import { deleteUserSchema } from "@/lib/actions/delete-user/schema";
import { InputType, ReturnType } from "@/lib/actions/delete-user/types";
import { createAction } from "@/lib/create-action";
import db from "@/lib/prisma";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth();
  console.log(session?.user.role);
  if (!session?.user || session.user.role !== Role.ADMIN)
    return { error: "دسترسی غیر مجاز" };

  const { id } = data;

  // Prevent deleting yourself
  if (session.user.id === id)
    return { error: "شما نمی‌توانید حساب کاربری خود را حذف کنید" };

  try {
    // Check if username already exists
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error("حساب کاربری یافت نشد");
    }
    if (existingUser.username === process.env.ADMIN_USERNAME)
      throw new Error(`شما نمی‌توانید این حساب کاربری را حذف کنید`);

    // Delete user
    await db.user.delete({
      where: { id },
    });
  } catch (e) {
    const error = e as Error;
    return { error: error.message || "خطا در حذف حساب کاربری" };
  }

  revalidatePath(`/admin`);

  return {
    message: "حساب کاربری با موفقیت حذف شد",
  };
};

export const deleteUser = createAction(deleteUserSchema, handler);
