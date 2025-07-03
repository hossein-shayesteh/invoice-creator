"use server";

import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

import db from "@/lib/prisma";

// GET /api/products - Get all products
export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { product_name: "asc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  const session = await auth();

  // Check if user is authenticated and is an admin
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 },
    );
  }

  try {
    const data = await request.json();

    // Validate required fields
    if (!data.code || !data.product_name) {
      return NextResponse.json(
        { error: "Product code and name are required" },
        { status: 400 },
      );
    }

    // Check if product with this code already exists
    const existingProduct = await db.product.findUnique({
      where: { code: data.code },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: `Product with code ${data.code} already exists` },
        { status: 409 },
      );
    }

    // Create new product
    const product = await db.product.create({
      data: {
        code: data.code,
        product_name: data.product_name,
        cc: parseFloat(data.cc) || 0,
        price: parseFloat(data.price) || 0,
        shipment: parseFloat(data.shipment) || 0,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
