"use server";

import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

import db from "@/lib/prisma";

// GET /api/users/[id] - Get a specific user (admin only)
export async function GET(
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
    const user = await db.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Include invoices
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            subtotal: true,
            shipping: true,
            total: true,
            totalCC: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

// DELETE /api/users/[id] - Delete a user (admin only)
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

  // Prevent deleting yourself
  if (session.user.id === params.id) {
    return NextResponse.json(
      { error: "You cannot delete your own account" },
      { status: 400 },
    );
  }

  try {
    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user
    await db.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
