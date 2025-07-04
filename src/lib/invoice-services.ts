"use server";

import db from "@/lib/prisma";

export const getAllInvoices = async () => {
  return db.invoice.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};
