import { Role } from "@prisma/client";
import { Product } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { DefaultSession } from "next-auth";
import "next-auth/jwt";

export interface CartItem extends Product {
  quantity: number;
  offerEnabled: boolean;
  offerQuantity?: number;
}

export interface PricingSettings {
  exchangeRate: number; // AED to IRR
  discountPercentage: number;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      username: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
    username: string | null;
    name: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    username: string | null;
  }
}

export type GetUserByIdResult = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    username: true;
    role: true;
    createdAt: true;
    updatedAt: true;
    invoices: {
      select: {
        id: true;
        invoiceNumber: true;
        subtotal: true;
        shipping: true;
        total: true;
        updatedAt: true;
        totalCC: true;
        createdAt: true;
      };
    };
  };
}>;

export type GetUserByIdInvoiceResult = Prisma.InvoiceGetPayload<{
  select: {
    id: true;
    invoiceNumber: true;
    subtotal: true;
    shipping: true;
    total: true;
    updatedAt: true;
    totalCC: true;
    createdAt: true;
  };
}>;
