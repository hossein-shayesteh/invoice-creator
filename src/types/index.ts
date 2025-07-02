import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";
import "next-auth/jwt";

export interface Product {
  id: number;
  code: string;
  product_name: string;
  cc: number;
  price: number;
  shipment: number;
}

export interface CartItem extends Product {
  quantity: number;
  offerEnabled: boolean;
  offerQuantity?: number;
}

export interface Invoice {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  exchangeRate: number;
  totalCC: number;
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
