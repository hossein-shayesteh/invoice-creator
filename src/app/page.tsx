'use client';

import { InvoiceGenerator } from '@/components/InvoiceGenerator';
import { PricingSettings } from '@/components/PricingSettings';
import { ProductCard } from '@/components/ProductCard';
import { ProductFilters } from '@/components/ProductFilters';
import { ShoppingCart } from '@/components/ShoppingCart';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product } from '@/types';
import { ShoppingCart as CartIcon, FileText, Loader2, Package, Settings } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [offerFilter, setOfferFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');

  // Load products from JSON
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/products.json');
        if (!response.ok) {
          throw new Error('Failed to load products');
        }
        const data = await response.json();
        setProducts(data);
        
        // Set initial price range based on actual data
        const maxPrice = Math.max(...data.map((p: Product) => p.price));
        setPriceRange([0, maxPrice]);
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback: try to load from src/app/products.json
        try {
          const fallbackResponse = await fetch('/src/app/products.json');
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            setProducts(fallbackData);
            const maxPrice = Math.max(...fallbackData.map((p: Product) => p.price));
            setPriceRange([0, maxPrice]);
          }
        } catch (fallbackError) {
          console.error('Fallback loading failed:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      // Search filter
      const matchesSearch = 
          product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  String(product.code).toLowerCase().includes(searchTerm.toLowerCase());
      
      // Price filter
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      // Offer filter
      const matchesOffer = 
        offerFilter === 'all' ||
        (offerFilter === 'with-offers' && product.offer) ||
        (offerFilter === 'no-offers' && !product.offer);
      
      return matchesSearch && matchesPrice && matchesOffer;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.product_name.localeCompare(b.product_name);
        case 'name-desc':
          return b.product_name.localeCompare(a.product_name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'code-asc':
          return String(a.code).localeCompare(String(b.code));
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, priceRange, offerFilter, sortBy]);

  const maxPrice = useMemo(() => {
    return products.length > 0 ? Math.max(...products.map(p => p.price)) : 500;
  }, [products]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Product Ordering & Invoice System
          </h1>
          <p className="text-gray-600">
            Browse products, manage your cart, and generate professional invoices
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products ({filteredProducts.length})
            </TabsTrigger>
            <TabsTrigger value="cart" className="flex items-center gap-2">
              <CartIcon className="w-4 h-4" />
              Cart
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="invoice" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Invoice
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <ProductFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              maxPrice={maxPrice}
              offerFilter={offerFilter}
              onOfferFilterChange={setOfferFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            {filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search or filter criteria
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.code} product={product} />
                ))}
              </div>
            )}
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
}
