"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { hash } from "bcryptjs";

import { updateUserSchema } from "@/lib/actions/update-user/schema";
import { InputType, ReturnType } from "@/lib/actions/update-user/types";
import { createAction } from "@/lib/create-action";
import db from "@/lib/prisma";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth();
  if (!session?.user && session?.user.role !== Role.ADMIN)
    return { error: "دسترسی غیرمجاز" };

  const { id, username, password, name, isAdmin, idNumber } = data;

  let user;

  try {
    // Check if user with this id already exists
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) throw new Error("حساب کاربری یافت نشد");

    // If username is being changed, check if the new username already exists
    if (username && username !== existingUser.username) {
      const userWithUsername = await db.user.findUnique({
        where: { username },
      });

      if (userWithUsername)
        throw new Error(`کاربر با نام کاربری "${username}" از قبل وجود دارد`);
    }

    const updateData: {
      name: string;
      username: string;
      idNumber: string;
      role: Role;
      password?: string;
    } = {
      name,
      username,
      idNumber,
      role: isAdmin ? Role.ADMIN : Role.USER,
    };

    if (password && password.trim() !== "") {
      updateData.password = await hash(password, 12);
    }

    // Update the user using the dynamically built data object
    user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        idNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (e) {
    const error = e as Error;
    return { error: error.message || "خطا در آپدیت حساب کاربری" };
  }

  revalidatePath(`/admin`);

  return {
    data: user,
    message: "حساب کاربری با موفقیت آپدیت شد",
  };
};

export const updateUser = createAction(updateUserSchema, handler);
