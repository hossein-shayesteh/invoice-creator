"use client";

import React, { useMemo, useState } from "react";

import { Product } from "@prisma/client";
import { MoreHorizontal, Pencil, Plus, Trash } from "lucide-react";
import { toast } from "sonner";

import { useAction } from "@/hooks/use-action";

import { createProduct } from "@/lib/actions/create-product";
import { deleteProduct } from "@/lib/actions/delete-product";
import { updateProduct } from "@/lib/actions/update-product";

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

import { ProductFilters } from "@/app/(main)/dashboard/_components/product-filters";

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
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");

  const { execute: executeDeleteProduct } = useAction(deleteProduct, {
    onSuccess: async (_date, message) => {
      toast.success(message);
    },
    onError: async (error) => {
      toast.error(error);
    },
  });

  const { execute: executeCreateProduct } = useAction(createProduct, {
    onSuccess: async (_date, message) => {
      toast.success(message);
      resetProductForm();
      setProductDialogOpen(false);
    },
    onError: async (error) => {
      toast.error(error);
    },
  });

  const { execute: executeUpdateProduct } = useAction(updateProduct, {
    onSuccess: async (_date, message) => {
      toast.success(message);
      resetProductForm();
      setProductDialogOpen(false);
    },
    onError: async (error) => {
      toast.error(error);
    },
  });

  // Reset product form
  const resetProductForm = () => {
    setProductFormData({
      code: "",
      product_name: "",
      cc: "0",
      price: "0",
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
    });
    setProductDialogOpen(true);
  };

  // Handle product form submission
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduct) {
      // Update existing product
      await executeUpdateProduct({ id: editingProduct.id, ...productFormData });
    } else {
      // Create new product
      await executeCreateProduct({ ...productFormData });
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    await executeDeleteProduct({ id: productId });
  };

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      // Search filter
      return (
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(product.code).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.product_name.localeCompare(b.product_name);
        case "name-desc":
          return b.product_name.localeCompare(a.product_name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "code-asc":
          return String(a.code).localeCompare(String(b.code));
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, sortBy]);

  if (!products)
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );

  return (
    <>
      <div
        className="my-4 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between"
        dir="rtl"
      >
        <h2 className="text-xl font-semibold">مدیریت محصولات</h2>
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
              افزودن محصول
            </Button>
          </DialogTrigger>
          {/* 1. Set direction and alignment for the Dialog Content */}
          <DialogContent className="text-right">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "ویرایش محصول" : "افزودن محصول جدید"}
              </DialogTitle>
              <DialogDescription>
                جزئیات محصول را در زیر وارد کنید.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  {/* 3. Translated form labels */}
                  <Label htmlFor="code">کد محصول *</Label>
                  {/* 4. Aligned input text to the right */}
                  <Input
                    id="code"
                    name="code"
                    value={productFormData.code}
                    onChange={handleProductInputChange}
                    required
                    className="text-right"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="product_name">نام محصول *</Label>
                  <Input
                    id="product_name"
                    name="product_name"
                    value={productFormData.product_name}
                    onChange={handleProductInputChange}
                    required
                    className="text-right"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cc">CC</Label>
                  <Input
                    id="cc"
                    name="cc"
                    type="number"
                    step="0.001"
                    value={productFormData.cc}
                    onChange={handleProductInputChange}
                    className="text-right"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="price">قیمت (درهم)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={productFormData.price}
                    onChange={handleProductInputChange}
                    className="text-right"
                  />
                </div>
              </div>

              <DialogFooter>
                {/* 5. Translated button text */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetProductForm();
                    setProductDialogOpen(false);
                  }}
                >
                  انصراف
                </Button>
                <Button type="submit">
                  {editingProduct ? "به‌روزرسانی" : "ایجاد"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ProductFilters
        searchTerm={searchTerm}
        SearchTermAction={setSearchTerm}
        sortBy={sortBy}
        SortByAction={setSortBy}
      />

      <Card dir="rtl" className="text-right">
        <CardContent className="p-0">
          {/* DESKTOP VIEW: TABLE */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">کد</TableHead>
                  <TableHead className="text-right">نام محصول</TableHead>
                  <TableHead className="text-right">CC</TableHead>
                  <TableHead className="text-right">قیمت (درهم)</TableHead>
                  <TableHead className="text-center">اقدامات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      محصولی یافت نشد.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono">
                        {product.code}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.product_name}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.cc.toLocaleString("fa-IR", {
                          minimumFractionDigits: 3,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.price.toLocaleString("fa-IR", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-center">
                        {/* --- Dropdown for Desktop View --- */}
                        <DropdownMenu dir="rtl">
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>اقدامات</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openProductEditDialog(product)}
                              className="flex cursor-pointer items-center gap-2"
                            >
                              <Pencil className="h-4 w-4" />
                              <span>ویرایش</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteProduct(product.id)}
                              className="flex cursor-pointer items-center gap-2 text-red-600"
                            >
                              <Trash className="h-4 w-4" />
                              <span>حذف</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* MOBILE VIEW: LIST OF CARDS */}
          <div className="block space-y-4 p-4 md:hidden">
            {filteredProducts.length === 0 ? (
              <div className="text-muted-foreground py-12 text-center">
                محصولی یافت نشد.
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold">{product.product_name}</p>
                    <p className="text-muted-foreground font-mono text-sm">
                      {product.code}
                    </p>
                    <p className="text-sm">
                      قیمت:{" "}
                      {product.price.toLocaleString("fa-IR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      | CC:{" "}
                      {product.cc.toLocaleString("fa-IR", {
                        minimumFractionDigits: 3,
                      })}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {/* --- Dropdown for Mobile View --- */}
                    <DropdownMenu dir="rtl">
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>اقدامات</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openProductEditDialog(product)}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          <span>ویرایش</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteProduct(product.id)}
                          className="flex cursor-pointer items-center gap-2 text-red-600"
                        >
                          <Trash className="h-4 w-4" />
                          <span>حذف</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};
export default AdminProductsSection;
