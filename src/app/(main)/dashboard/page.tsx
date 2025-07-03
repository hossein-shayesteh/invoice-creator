import {
  ShoppingCart as CartIcon,
  FileText,
  Package,
  Settings,
} from "lucide-react";

import { getAllProducts } from "@/lib/product-services";

import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { PricingSettings } from "@/components/PricingSettings";
import { ShoppingCart } from "@/components/ShoppingCart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ProductSection from "@/app/(main)/dashboard/_components/product-section";

const DashboardPage = async () => {
  const products = await getAllProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Product Ordering & Invoice System
          </h1>
          <p className="text-gray-600">
            Browse products, manage your cart, and generate professional
            invoices
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="flex w-full flex-wrap">
            <TabsTrigger
              value="products"
              className="flex min-w-[120px] flex-1 items-center justify-center gap-1"
            >
              <Package className="h-4 w-4 sm:mr-0" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger
              value="cart"
              className="flex min-w-[120px] flex-1 items-center justify-center gap-1"
            >
              <CartIcon className="h-4 w-4 sm:mr-0" />
              <span className="sm:inline">Cart</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex min-w-[120px] flex-1 items-center justify-center gap-1"
            >
              <Settings className="h-4 w-4 sm:mr-0" />
              <span className="sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger
              value="invoice"
              className="flex min-w-[120px] flex-1 items-center justify-center gap-1"
            >
              <FileText className="h-4 w-4 sm:mr-0" />
              <span className="sm:inline">Invoice</span>
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <ProductSection products={products} />
          </TabsContent>

          {/* Cart Tab */}
          <TabsContent value="cart">
            <ShoppingCart />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <PricingSettings />
          </TabsContent>

          {/* Invoice Tab */}
          <TabsContent value="invoice">
            <InvoiceGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
export default DashboardPage;
