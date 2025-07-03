"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

import { Product } from "@/types";

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    product_name: "",
    cc: 0,
    price: 0,
    shipment: 0,
  });

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError("Error loading products. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "product_name" ? value : Number(value),
    });
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      code: "",
      product_name: "",
      cc: 0,
      price: 0,
      shipment: 0,
    });
  };

  // Open edit dialog with product data
  const handleEditClick = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      code: product.code,
      product_name: product.product_name,
      cc: product.cc,
      price: product.price,
      shipment: product.shipment,
    });
    setIsEditDialogOpen(true);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // Add new product
  const handleAddProduct = async () => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add product");
      }

      await fetchProducts();
      setIsAddDialogOpen(false);
      resetFormData();
      toast.success("Product added successfully");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to add product");
      console.error(error);
    }
  };

  // Update existing product
  const handleUpdateProduct = async () => {
    if (!currentProduct) return;

    try {
      const response = await fetch(`/api/products/${currentProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update product");
      }

      await fetchProducts();
      setIsEditDialogOpen(false);
      resetFormData();
      setCurrentProduct(null);
      toast.success("Product updated successfully");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to update product");
      console.error(err);
    }
  };

  // Delete product
  const handleDeleteProduct = async () => {
    if (!currentProduct) return;

    try {
      const response = await fetch(`/api/products/${currentProduct.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete product");
      }

      await fetchProducts();
      setIsDeleteDialogOpen(false);
      setCurrentProduct(null);
      toast.success("Product deleted successfully");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to delete product");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading products...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Add New Product
        </Button>
      </div>

      {/* Products Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>CC</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Shipment</TableHead>
              <TableHead>Actions</TableHead>
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
                  <TableCell>{product.cc}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>${product.shipment.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(product)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(product)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Code
              </Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product_name" className="text-right">
                Name
              </Label>
              <Input
                id="product_name"
                name="product_name"
                value={formData.product_name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cc" className="text-right">
                CC
              </Label>
              <Input
                id="cc"
                name="cc"
                type="number"
                value={formData.cc}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shipment" className="text-right">
                Shipment
              </Label>
              <Input
                id="shipment"
                name="shipment"
                type="number"
                value={formData.shipment}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProduct}>Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-code" className="text-right">
                Code
              </Label>
              <Input
                id="edit-code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-product_name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-product_name"
                name="product_name"
                value={formData.product_name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-cc" className="text-right">
                CC
              </Label>
              <Input
                id="edit-cc"
                name="cc"
                type="number"
                value={formData.cc}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">
                Price
              </Label>
              <Input
                id="edit-price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-shipment" className="text-right">
                Shipment
              </Label>
              <Input
                id="edit-shipment"
                name="shipment"
                type="number"
                value={formData.shipment}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct}>Update Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete the product &quot;
              {currentProduct?.product_name}&quot;? This action cannot be
              undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
