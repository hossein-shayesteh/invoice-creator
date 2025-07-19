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
  title: {
    default: "Success Family",
    template: "%s | Success Family",
  },
  description:
    "Easily order products, manage invoices, and grow with Success Family. Your modern solution for efficient online ordering.",

  keywords: [
    "product ordering",
    "invoice generation",
    "e-commerce",
    "business tools",
    "Success Family",
  ],
  creator: "Success Family",

  robots: {
    index: true,
    follow: true,
  },
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
