import { Package, User } from "lucide-react";

import { getAllProducts } from "@/lib/product-services";
import { getAllUsers } from "@/lib/user-services";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import AdminProductsSection from "@/app/(main)/admin/_components/admin-products-section";
import AdminUsersSection from "@/app/(main)/admin/_components/admin-users-section";

const AdminPage = async () => {
  const users = await getAllUsers();
  const products = await getAllProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger
            value="products"
            className="flex w-32 items-center gap-2"
          >
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="users" className="flex w-32 items-center gap-2">
            <User className="h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <AdminProductsSection products={products} />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <AdminUsersSection users={users} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
