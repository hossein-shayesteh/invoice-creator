import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Create admin user
  const hashedPassword = await hash("JCkwzY2Ek0T7WTnbc", 12);

  const adminUser = await prisma.user.upsert({
    where: { username: "pooyan" },
    update: {},
    create: {
      idNumber :"971001621728",
      name: "Pooyan Shafiee",
      username: "pooyan",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin user created:", adminUser);

  // Load and seed products
  const productsPath = path.join(process.cwd(), "public", "products.json");
  const productsData = JSON.parse(fs.readFileSync(productsPath, "utf8"));

  console.log(`Loading ${productsData.length} products...`);

  for (const productData of productsData) {
    await prisma.product.upsert({
      where: { code: productData.code },
      update: {
        product_name: productData.product_name,
        cc: productData.cc,
        price: productData.price,
        shipment: productData.shipment,
      },
      create: {
        code: productData.code,
        product_name: productData.product_name,
        cc: productData.cc,
        price: productData.price,
        shipment: productData.shipment,
      },
    });
  }

  console.log("Products seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
