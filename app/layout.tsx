import React from "react";

import { Vazirmatn } from "next/font/google";

import "./globals.css";
import { CartProvider } from "@/contexts/cart-context";
import type { Metadata } from "next";

import AuthProvider from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";

// 2. Configure the Persian font
const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Success Family",
  description:
    "Modern Next.js application for product ordering and invoice generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="rtl">
      <body className={`${vazirmatn.variable} antialiased`}>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
