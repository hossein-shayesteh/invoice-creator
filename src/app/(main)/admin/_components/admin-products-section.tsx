"use client";

import React, { useState } from "react";

import { Product } from "@prisma/client";
import { MoreHorizontal, Pencil, Plus, Trash } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

interface AdminProductSectionProps {
  products: Product[];
}

const AdminProductsSection = ({ products }: AdminProductSectionProps) => {
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState({
    code: "",
    product_name: "",
    cc: "0",
    price: "0",
    shipment: "0",
  });

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

  // Handle product form input change
  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProductFormData((prev) => ({ ...prev, [name]: value }));
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
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
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
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  if (!products)
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );

  return (
    <>
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Product Management</h2>
        <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
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

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">CC Points</TableHead>
                <TableHead className="text-right">Price (AED)</TableHead>
                <TableHead className="text-right">Shipment (IRR)</TableHead>
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
    </>
  );
};
export default AdminProductsSection;
