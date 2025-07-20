"use client";

import { useMemo, useState } from "react";

import { Product } from "@prisma/client";
import { Package } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { ProductCard } from "@/app/(main)/dashboard/_components/product-card";
import { ProductFilters } from "@/app/(main)/dashboard/_components/product-filters";

interface ProductProps {
  products: Product[];
}

const ProductSection = ({ products }: ProductProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      if (!product.isAvailable) return;
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
  return (
    <>
      <ProductFilters
        searchTerm={searchTerm}
        SearchTermAction={setSearchTerm}
        sortBy={sortBy}
        SortByAction={setSortBy}
      />

      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              محصولی یافت نشد
            </h3>
            <p className="text-gray-600">
              معیارهای جستجو یا فیلتر خود را تنظیم کنید
            </p>
          </CardContent>
        </Card>
      ) : (
        <div
          dir="rtl"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
};

export default ProductSection;
