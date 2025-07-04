"use server";

import db from "@/lib/prisma";

import { GetUserByIdResult } from "@/types";

export const getAllUsers = async () => {
  return db.user.findMany({
    orderBy: { createdAt: "asc" },
  });
};

export const getUserById = async (
  id: string,
): Promise<GetUserByIdResult | null> => {
  return db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      invoices: {
        select: {
          id: true,
          invoiceNumber: true,
          subtotal: true,
          shipping: true,
          total: true,
          updatedAt: true,
          totalCC: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
};
