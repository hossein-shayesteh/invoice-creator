import {
  ShoppingCart as CartIcon,
  FileText,
  Package,
  Settings,
} from "lucide-react";

import { getAllProducts } from "@/lib/product-services";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { InvoiceGenerator } from "@/app/(main)/dashboard/_components/invoice-generator";
import { PricingSettings } from "@/app/(main)/dashboard/_components/pricing-settings";
import ProductSection from "@/app/(main)/dashboard/_components/product-section";
import { ShoppingCart } from "@/app/(main)/dashboard/_components/shopping-cart";
import { UserButton } from "@/app/(main)/dashboard/_components/user-button";

const DashboardPage = async () => {
  const products = await getAllProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative container mx-auto px-4 py-8">
        <div className="absolute top-8 left-4">
          <UserButton />
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col items-center justify-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Success Family
          </h1>
          <p className="text-gray-600">
            ایستاده ایم تا هرکس بر بلندای آرزوهایش اوج بگیرد
          </p>
        </div>

        <Tabs defaultValue="products" className="space-y-6" dir="rtl">
          <TabsList className="flex w-full flex-wrap">
            <TabsTrigger
              value="products"
              className="flex min-w-[120px] flex-1 items-center justify-center gap-2"
            >
              <span className="">محصولات</span>
              <Package className="hidden h-4 w-4 sm:inline" />
            </TabsTrigger>
            <TabsTrigger
              value="cart"
              className="flex min-w-[120px] flex-1 items-center justify-center gap-2"
            >
              <span>سبد خرید</span>
              <CartIcon className="hidden h-4 w-4 sm:inline" />
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex min-w-[120px] flex-1 items-center justify-center gap-2"
            >
              <span>تنظیمات</span>
              <Settings className="hidden h-4 w-4 sm:inline" />
            </TabsTrigger>
            <TabsTrigger
              value="invoice"
              className="flex min-w-[120px] flex-1 items-center justify-center gap-2"
            >
              <span>فاکتور</span>
              <FileText className="hidden h-4 w-4 sm:inline" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <ProductSection products={products} />
          </TabsContent>
          <TabsContent value="cart">
            <ShoppingCart />
          </TabsContent>
          <TabsContent value="settings">
            <PricingSettings />
          </TabsContent>
          <TabsContent value="invoice">
            <InvoiceGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
export default DashboardPage;
