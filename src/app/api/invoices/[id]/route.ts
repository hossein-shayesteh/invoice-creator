"use server";

import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

import db from "@/lib/prisma";

// GET /api/invoices/[id] - Get a specific invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();

  // Check if user is authenticated
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Authentication required" },
      { status: 401 },
    );
  }

  try {
    const invoice = await db.invoice.findUnique({
      where: { id: params.id },
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

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Regular users can only view their own invoices
    if (session.user.role !== "ADMIN" && invoice.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You can only view your own invoices" },
        { status: 403 },
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 },
    );
  }
}

// DELETE /api/invoices/[id] - Delete an invoice (admin only)
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
    // Check if invoice exists
    const existingInvoice = await db.invoice.findUnique({
      where: { id: params.id },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Delete invoice (cascade will delete invoice items)
    await db.invoice.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 },
    );
  }
}
