"use server";

import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { InvoiceItem } from "@prisma/client";

import db from "@/lib/prisma";

// GET /api/invoices - Get all invoices (admin) or user's invoices (user)
export async function GET() {
  const session = await auth();

  // Check if user is authenticated
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Authentication required" },
      { status: 401 },
    );
  }

  try {
    // For admin, get all invoices
    // For regular user, get only their invoices
    const invoices = await db.invoice.findMany({
      where: {
        ...(session.user.role !== "ADMIN" && { userId: session.user.id }),
      },
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

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 },
    );
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(request: NextRequest) {
  const session = await auth();

  // Check if user is authenticated
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Authentication required" },
      { status: 401 },
    );
  }

  try {
    const data = await request.json();

    // Validate required fields
    if (
      !data.invoiceNumber ||
      !data.items ||
      !Array.isArray(data.items) ||
      data.items.length === 0
    ) {
      return NextResponse.json(
        { error: "Invoice number and items are required" },
        { status: 400 },
      );
    }

    // Create invoice with items
    const invoice = await db.invoice.create({
      data: {
        invoiceNumber: data.invoiceNumber,
        userId: session.user.id,
        subtotal: data.subtotal || 0,
        shipping: data.shipping || 0,
        total: data.total || 0,
        totalCC: data.totalCC || 0,
        exchangeRate: data.exchangeRate || 0,
        discountPercent: data.discount || 0,
        items: {
          create: data.items.map((item: InvoiceItem) => ({
            productId: item.id,
            quantity: item.quantity,
            offerEnabled: item.offerEnabled || false,
            offerQuantity: item.offerQuantity || 0,
            unitPrice: item.unitPrice || 0,
            totalPrice: item.totalPrice || 0,
          })),
        },
      },
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
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 },
    );
  }
}
