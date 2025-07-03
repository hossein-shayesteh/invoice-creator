"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import {
  FileText,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Trash,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Product } from "@/types";

export default function AdminPage() {
  const { session, status } = useAuth();
  const router = useRouter();

  // State for products management
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState({
    code: "",
    product_name: "",
    cc: "0",
    price: "0",
    shipment: "0",
  });

  // State for users management
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: "",
    username: "",
    password: "",
    isAdmin: false,
  });

  // State for user details
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [userInvoices, setUserInvoices] = useState<any[]>([]);

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "ADMIN") {
        router.push("/dashboard");
        toast.info("You don't have permission to access this page.");
      }
    } else if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [session, status, router]);

  // Fetch products
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Fetch user details
  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data);
        setUserInvoices(data.invoices || []);
        setUserDetailsOpen(true);
      } else {
        toast.error("Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to fetch user details");
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchProducts();
      fetchUsers();
    }
  }, [status, session]);

  // Handle product form input change
  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProductFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle user form input change
  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox change for isAdmin
  const handleCheckboxChange = (checked: boolean) => {
    setUserFormData((prev) => ({ ...prev, isAdmin: checked }));
  };

  // Reset product form
  const resetProductForm = () => {
    setProductFormData({
      code: "",
      product_name: "",
      cc: "0",
      price: "0",
      shipment: "0",
    });
    setEditingProduct(null);
  };

  // Reset user form
  const resetUserForm = () => {
    setUserFormData({
      name: "",
      username: "",
      password: "",
      isAdmin: false,
    });
  };

  // Open product dialog for editing
  const openProductEditDialog = (product: Product) => {
    setEditingProduct(product);
    setProductFormData({
      code: product.code,
      product_name: product.product_name,
      cc: product.cc.toString(),
      price: product.price.toString(),
      shipment: product.shipment.toString(),
    });
    setProductDialogOpen(true);
  };

  // Handle product form submission
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let response;

      if (editingProduct) {
        // Update existing product
        response = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productFormData),
        });
      } else {
        // Create new product
        response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productFormData),
        });
      }

      if (response.ok) {
        toast.success(
          editingProduct
            ? "Product updated successfully"
            : "Product created successfully",
        );
        setProductDialogOpen(false);
        resetProductForm();
        fetchProducts();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
  };

  // Handle user form submission
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userFormData),
      });

      if (response.ok) {
        toast.success("User created successfully");
        setUserDialogOpen(false);
        resetUserForm();
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user");
    }
  };

  // Delete product
  const deleteProduct = async (productId: string | number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Product deleted successfully");
        fetchProducts();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? All their invoices will also be deleted.",
      )
    )
      return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("User deleted successfully");
        fetchUsers();
        if (selectedUser?.id === userId) {
          setUserDetailsOpen(false);
          setSelectedUser(null);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  // Delete invoice
  const deleteInvoice = async (invoiceId: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Invoice deleted successfully");
        // Refresh user details to update invoice list
        if (selectedUser) {
          fetchUserDetails(selectedUser.id);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete invoice");
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Product Management</h2>
            <Dialog
              open={productDialogOpen}
              onOpenChange={setProductDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetProductForm();
                    setProductDialogOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                  <DialogDescription>
                    Fill in the product details below.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="code">Product Code *</Label>
                      <Input
                        id="code"
                        name="code"
                        value={productFormData.code}
                        onChange={handleProductInputChange}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="product_name">Product Name *</Label>
                      <Input
                        id="product_name"
                        name="product_name"
                        value={productFormData.product_name}
                        onChange={handleProductInputChange}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="cc">CC Points</Label>
                      <Input
                        id="cc"
                        name="cc"
                        type="number"
                        step="0.001"
                        value={productFormData.cc}
                        onChange={handleProductInputChange}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="price">Price (AED)</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        value={productFormData.price}
                        onChange={handleProductInputChange}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="shipment">Shipment (IRR)</Label>
                      <Input
                        id="shipment"
                        name="shipment"
                        type="number"
                        value={productFormData.shipment}
                        onChange={handleProductInputChange}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetProductForm();
                        setProductDialogOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingProduct ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoadingProducts ? (
            <div className="flex h-40 items-center justify-center">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">CC Points</TableHead>
                      <TableHead className="text-right">Price (AED)</TableHead>
                      <TableHead className="text-right">
                        Shipment (IRR)
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No products found
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.code}</TableCell>
                          <TableCell>{product.product_name}</TableCell>
                          <TableCell className="text-right">
                            {product.cc.toFixed(3)}
                          </TableCell>
                          <TableCell className="text-right">
                            {product.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {product.shipment.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => openProductEditDialog(product)}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => deleteProduct(product.id)}
                                  className="text-red-600"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">User Management</h2>
            <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetUserForm();
                    setUserDialogOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Fill in the user details below.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleUserSubmit} className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={userFormData.name}
                        onChange={handleUserInputChange}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        name="username"
                        value={userFormData.username}
                        onChange={handleUserInputChange}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={userFormData.password}
                        onChange={handleUserInputChange}
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isAdmin"
                        checked={userFormData.isAdmin}
                        onCheckedChange={handleCheckboxChange}
                      />
                      <Label htmlFor="isAdmin">Admin User</Label>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetUserForm();
                        setUserDialogOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoadingUsers ? (
            <div className="flex h-40 items-center justify-center">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-center">Invoices</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.role === "ADMIN" ? "default" : "outline"
                              }
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {user._count?.invoices || 0}
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => fetchUserDetails(user.id)}
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => deleteUser(user.id)}
                                  className="text-red-600"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* User Details Dialog */}
          <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
              </DialogHeader>

              {selectedUser && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="mb-2 font-semibold">User Information</h3>
                      <p>
                        <strong>Name:</strong> {selectedUser.name}
                      </p>
                      <p>
                        <strong>Username:</strong> {selectedUser.username}
                      </p>
                      <p>
                        <strong>Role:</strong>{" "}
                        <Badge
                          variant={
                            selectedUser.role === "ADMIN"
                              ? "default"
                              : "outline"
                          }
                        >
                          {selectedUser.role}
                        </Badge>
                      </p>
                      <p>
                        <strong>Created:</strong>{" "}
                        {formatDate(selectedUser.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 font-semibold">
                      Invoices ({userInvoices.length})
                    </h3>
                    {userInvoices.length === 0 ? (
                      <p className="text-gray-500">No invoices found</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice #</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">
                              CC Points
                            </TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userInvoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell>{invoice.invoiceNumber}</TableCell>
                              <TableCell className="text-right">
                                {invoice.total.toLocaleString()} IRR
                              </TableCell>
                              <TableCell className="text-right">
                                {invoice.totalCC.toFixed(3)}
                              </TableCell>
                              <TableCell>
                                {formatDate(invoice.createdAt)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteInvoice(invoice.id)}
                                  className="text-red-600"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
