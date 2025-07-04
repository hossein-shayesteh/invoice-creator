import db from "@/lib/prisma";

export const getAllUsers = async () => {
  return db.user.findMany({
    orderBy: { createdAt: "asc" },
  });
};
