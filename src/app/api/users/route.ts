"use server";

import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { hash } from "bcryptjs";

import db from "@/lib/prisma";

// GET /api/users - Get all users (admin only)
export async function GET() {
  const session = await auth();

  // Check if user is authenticated and is an admin
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 },
    );
  }

  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Don't include password
        // Include count of invoices
        _count: {
          select: {
            invoices: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

// POST /api/users - Create a new user (admin only)
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
    if (!data.username || !data.password || !data.name) {
      return NextResponse.json(
        { error: "Username, password, and name are required" },
        { status: 400 },
      );
    }

    // Check if username already exists
    const existingUser = await db.user.findUnique({
      where: { username: data.username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: `User with username ${data.username} already exists` },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await hash(data.password, 10);

    // Create new user
    const user = await db.user.create({
      data: {
        name: data.name,
        username: data.username,
        password: hashedPassword,
        role: data.isAdmin ? Role.ADMIN : Role.USER,
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
