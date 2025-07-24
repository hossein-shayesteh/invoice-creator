"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { hash } from "bcryptjs";

import { createUserSchema } from "@/lib/actions/create-user/schema";
import { InputType, ReturnType } from "@/lib/actions/create-user/types";
import { createAction } from "@/lib/create-action";
import db from "@/lib/prisma";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth();

  const isCurrentUserModerator = session?.user.role === "MODERATOR";
  const isCurrentUserAdmin = session?.user.role === "ADMIN";

  if (!session?.user && (isCurrentUserModerator || isCurrentUserAdmin))
    return { error: "دسترسی غیرمجاز" };

  const { username, password, name, isAdmin, idNumber, isModerator } = data;

  let user;

  try {
    // Check if username already exists
    const existingUser = await db.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new Error(`کاربر با نام کاربری "${username}" از قبل وجود دارد`);
    }

    if (isAdmin && isModerator) {
      return { error: "کاربر نمی‌تواند هم‌زمان ادمین و دستیار ادمین باشد" };
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create new user
    user = await db.user.create({
      data: {
        name,
        username,
        idNumber,
        password: hashedPassword,
        role: isAdmin ? Role.ADMIN : isModerator ? Role.MODERATOR : Role.USER,
      },
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
    return { error: error.message || "خطا در ایجاد کاربر" };
  }

  revalidatePath(`/admin`);

  return {
    data: user,
    message: "حساب کاربری با موفقیت ایجاد شد",
  };
};

export const createUser = createAction(createUserSchema, handler);
