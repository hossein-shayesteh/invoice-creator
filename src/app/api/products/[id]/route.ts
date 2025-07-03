"use server";

import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

import db from "@/lib/prisma";

// GET /api/products/[id] - Get a specific product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const product = await db.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id: params.id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // If code is being changed, check if the new code already exists
    if (data.code && data.code !== existingProduct.code) {
      const productWithCode = await db.product.findUnique({
        where: { code: data.code },
      });

      if (productWithCode) {
        return NextResponse.json(
          { error: `Product with code ${data.code} already exists` },
          { status: 409 },
        );
      }
    }

    // Update product
    const updatedProduct = await db.product.update({
      where: { id: params.id },
      data: {
        code: data.code || existingProduct.code,
        product_name: data.product_name || existingProduct.product_name,
        cc: data.cc !== undefined ? parseFloat(data.cc) : existingProduct.cc,
        price:
          data.price !== undefined
            ? parseFloat(data.price)
            : existingProduct.price,
        shipment:
          data.shipment !== undefined
            ? parseFloat(data.shipment)
            : existingProduct.shipment,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();

  // Check if user is authenticated and is an admin
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 },
    );
  }

  try {
    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id: params.id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete product
    await db.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
