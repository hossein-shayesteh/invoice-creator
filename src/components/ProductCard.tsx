'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';
import { BadgePercent, CheckCircle, Package, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [offerEnabled, setOfferEnabled] = useState(false);
  const { addToCart, state } = useCart();

  const handleAddToCart = () => {
    setQuantity(1);
    addToCart(product, quantity, offerEnabled);
    toast(
    <div className="flex items-start gap-3">
      <CheckCircle className="text-green-600 w-5 h-5 mt-1" />
      <div className="flex flex-col">
        <p className="font-semibold text-sm text-gray-800">
          {product.product_name} added to cart!
        </p>
        <p className="text-xs text-gray-600">
          Quantity: {quantity}{' '}
          {offerEnabled && (
            <span className="inline-flex items-center text-green-700 ml-2">
              <BadgePercent className="w-3 h-3 mr-1" />
              Offer applied
            </span>
          )}
        </p>
      </div>
    </div>,
    {
      duration: 3000,
      className: 'bg-white border border-gray-200 shadow-lg px-4 py-3 rounded-xl',
    }
  );
  };

  const calculateDisplayPrice = () => {
    const { exchangeRate, discountPercentage } = state.pricingSettings;
    const basePrice = product.price * exchangeRate;
    const shippingCost = product.cc * exchangeRate;
    const total = basePrice + shippingCost;
    const discountAmount = (total * discountPercentage) / 100;
    return total - discountAmount;
  };

  const calculateOfferPrice = () => {
    if (!product.offer || !offerEnabled) return calculateDisplayPrice();
    
    const { exchangeRate, discountPercentage } = state.pricingSettings;
    const effectivePrice = product.price * exchangeRate; // Price for 1 item when buying 'offer' quantity
    const shippingCost = product.cc * product.offer * exchangeRate; // Shipping for all items
    const total = effectivePrice + shippingCost;
    const discountAmount = (total * discountPercentage) / 100;
    return total - discountAmount;
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {product.product_name}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {product.code}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Base Price (AED):</span>
            <span className="font-medium">{product.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Shipping (CC):</span>
            <span className="font-medium">{product.cc.toFixed(3)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total (IRR):</span>
              <div className="text-right">
                {offerEnabled && product.offer ? (
                  <div>
                    <div className="text-sm text-gray-500 line-through">
                      {calculateDisplayPrice().toLocaleString()}
                    </div>
                    <div className="font-bold text-green-600">
                      {calculateOfferPrice().toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <span className="font-bold text-lg">
                    {calculateDisplayPrice().toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {product.offer && (
          <div className="space-y-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`offer-${product.code}`}
                checked={offerEnabled}
                onCheckedChange={(checked) => setOfferEnabled(checked as boolean)}
              />
              <Label htmlFor={`offer-${product.code}`} className="text-sm font-medium">
                Enable Offer
              </Label>
              <Badge variant="destructive" className="text-xs">
                {product.offer} for 1
              </Badge>
            </div>
            {offerEnabled && (
              <div className="text-xs text-orange-700">
                <Package className="inline w-3 h-3 mr-1" />
                Get {product.offer} products for the price of 1! Shipping applies to all items.
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor={`quantity-${product.code}`} className="text-sm font-medium">
            Quantity
          </Label>
          <Input
            id={`quantity-${product.code}`}
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full"
          />
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleAddToCart} 
          className="w-full"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}