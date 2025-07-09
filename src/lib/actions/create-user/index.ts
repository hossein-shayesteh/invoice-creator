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
  if (!session?.user && session?.user.role !== Role.ADMIN)
    return { error: "Unauthorized." };

  const { username, password, name, isAdmin, idNumber } = data;

  let user;

  try {
    // Check if username already exists
    const existingUser = await db.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new Error(`User with username "${username}" already exists`);
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
        role: isAdmin ? Role.ADMIN : Role.USER,
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
    return { error: error.message || "Failed to create user" };
  }

  revalidatePath(`/admin`);

  return {
    data: user,
    message: "User created successfully.",
  };
};

export const createUser = createAction(createUserSchema, handler);
