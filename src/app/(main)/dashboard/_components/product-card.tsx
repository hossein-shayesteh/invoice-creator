"use client";

import { useState } from "react";

import { useCart } from "@/contexts/CartContext";
import { Product } from "@prisma/client";
import { BadgePercent, CheckCircle, Package, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [offerEnabled, setOfferEnabled] = useState(false);
  const [offerQuantity, setOfferQuantity] = useState(1);
  const { addToCart, state } = useCart();

  const handleAddToCart = () => {
    setQuantity(1);
    addToCart(
      product,
      quantity,
      offerEnabled,
      offerEnabled ? offerQuantity : undefined,
    );
    toast(
      <div className="flex items-start gap-3">
        <CheckCircle className="mt-1 h-5 w-5 text-green-600" />
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-gray-800">
            {product.product_name} added to cart!
          </p>
          <p className="text-xs text-gray-600">
            Quantity: {quantity}{" "}
            {offerEnabled && (
              <span className="ml-2 inline-flex items-center text-green-700">
                <BadgePercent className="mr-1 h-3 w-3" />+{offerQuantity} free
                (shipping only)
              </span>
            )}
          </p>
        </div>
      </div>,
      {
        duration: 3000,
        className:
          "bg-white border border-gray-200 shadow-lg px-4 py-3 rounded-xl",
      },
    );
  };

  const calculateDisplayPrice = () => {
    const { exchangeRate, discountPercentage } = state.pricingSettings;
    const basePrice = Math.floor(product.price * exchangeRate);
    const shippingCost = Math.floor(product.shipment);
    const total = basePrice + shippingCost;
    const discountAmount = Math.floor((total * discountPercentage) / 100);
    return total - discountAmount;
  };

  const calculateOfferPrice = () => {
    if (!offerEnabled) return calculateDisplayPrice();

    const { exchangeRate, discountPercentage } = state.pricingSettings;
    const basePrice = Math.floor(product.price * exchangeRate); // Price for paid items only
    const totalShippingCost = Math.floor(
      product.shipment * (quantity + offerQuantity),
    ); // Shipping for all items
    const total = basePrice + totalShippingCost;
    const discountAmount = Math.floor((total * discountPercentage) / 100);
    return total - discountAmount;
  };

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
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
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Base Price (AED):</span>
            <span className="font-medium">{product.price.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>CC Points:</span>
            <span className="font-medium">{product.cc.toFixed(3)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Shipment (IRR):</span>
            <span className="font-medium">
              {product.shipment.toLocaleString()}
            </span>
          </div>
          <div className="border-t pt-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total (IRR):</span>
              <div className="text-right">
                {offerEnabled ? (
                  <div>
                    <div className="text-sm text-gray-500 line-through">
                      {calculateDisplayPrice().toLocaleString()}
                    </div>
                    <div className="font-bold text-green-600">
                      {calculateOfferPrice().toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <span className="text-lg font-bold">
                    {calculateDisplayPrice().toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-orange-200 bg-orange-50 p-3">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`offer-${product.code}`}
              className="text-sm font-medium"
            >
              Special Offer
            </Label>
            <Switch
              id={`offer-${product.code}`}
              checked={offerEnabled}
              onCheckedChange={setOfferEnabled}
            />
          </div>
          {offerEnabled && (
            <div className="space-y-2">
              <Label
                htmlFor={`offer-quantity-${product.code}`}
                className="text-xs text-orange-700"
              >
                Additional products (pay shipping only):
              </Label>
              <Input
                id={`offer-quantity-${product.code}`}
                type="number"
                min="1"
                value={offerQuantity}
                onChange={(e) =>
                  setOfferQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-full text-sm"
              />
              <div className="text-xs text-orange-700">
                <Package className="mr-1 inline h-3 w-3" />
                Get {offerQuantity} additional products for shipping cost only!
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor={`quantity-${product.code}`}
            className="text-sm font-medium"
          >
            Quantity
          </Label>
          <Input
            id={`quantity-${product.code}`}
            type="number"
            min="1"
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="w-full"
          />
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={handleAddToCart} className="w-full" size="sm">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
