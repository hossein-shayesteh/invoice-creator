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
  if (!session?.user && session?.user.role !== Role.ADMIN)
    return { error: "Unauthorized: Admin access required" };

  const { id } = data;

  // Prevent deleting yourself
  if (session.user.id === id)
    return { error: "You cannot delete your own account" };

  try {
    // Check if username already exists
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error(`User not found`);
    }

    // Delete user
    await db.user.delete({
      where: { id },
    });
  } catch (e) {
    const error = e as Error;
    return { error: error.message || "Failed to delete user" };
  }

  revalidatePath(`/admin`);

  return {
    message: "User deleted successfully",
  };
};

export const deleteUser = createAction(deleteUserSchema, handler);
