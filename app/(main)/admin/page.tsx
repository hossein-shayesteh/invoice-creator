import { Package, User } from "lucide-react";

import { getAllProducts } from "@/lib/product-services";
import { getAllUsers } from "@/lib/user-services";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import AdminProductsSection from "@/app/(main)/admin/_components/admin-products-section";
import AdminUsersSection from "@/app/(main)/admin/_components/admin-users-section";

const AdminPage = async () => {
  const users = await getAllUsers();
  const products = await getAllProducts();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8" dir="rtl">
      <div className="mb-2 text-right">
        <h1 className="text-3xl font-bold">داشبورد ادمین</h1>
        <p className="text-muted-foreground">
          مدیریت کاربران و محصولات فروشگاه
        </p>
      </div>

      <Tabs
        defaultValue="products"
        className="flex flex-col gap-6 py-6 md:w-full md:flex-row md:justify-center"
        dir="rtl"
      >
        <TabsList
          dir="rtl"
          className="flex h-fit w-full flex-row justify-start rounded-lg border md:w-64 md:flex-col md:p-3"
        >
          <TabsTrigger
            value="products"
            className="flex w-full items-center justify-center gap-2 px-4 py-2 text-right md:justify-start"
          >
            <Package className="h-5 w-5" />
            <span>محصولات</span>
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="flex w-full items-center justify-center gap-2 px-4 py-2 text-right md:justify-start"
          >
            <User className="h-5 w-5" />
            <span>کاربران</span>
          </TabsTrigger>
        </TabsList>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1">
          <TabsContent value="products">
            <Card>
              <CardContent>
                <AdminProductsSection products={products} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardContent>
                <AdminUsersSection users={users} />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AdminPage;
