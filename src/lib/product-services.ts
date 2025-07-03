import db from "@/lib/prisma";

export const getAllProducts = async () => {
  return db.product.findMany({
    orderBy: { product_name: "asc" },
  });
};
