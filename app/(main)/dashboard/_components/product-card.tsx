"use client";

import { useState } from "react";

import { useCart } from "@/contexts/cart-context";
import { Product } from "@prisma/client";
import { BadgePercent, CheckCircle, ShoppingCart } from "lucide-react";
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
  const [quantity, setQuantity] = useState(0);
  const [offerEnabled, setOfferEnabled] = useState(false);
  const [offerQuantity, setOfferQuantity] = useState(0);
  const { addToCart, state } = useCart();

  const handleAddToCart = () => {
    if (quantity === 0) return;
    setQuantity(0);
    addToCart(
      product,
      quantity,
      offerEnabled,
      offerEnabled && offerQuantity > 0 ? offerQuantity : undefined,
    );
    toast(
      <div className="flex items-start gap-3">
        <CheckCircle className="mt-1 h-5 w-5 text-green-600" />
        <div className="flex flex-col text-right">
          <p className="text-sm font-semibold text-gray-800">
            {product.product_name} به سبد خرید اضافه شد!
          </p>
          <p className="text-xs text-gray-600">
            تعداد: {quantity}{" "}
            {offerEnabled && (
              <span className="ms-2 inline-flex items-center text-green-700">
                <BadgePercent className="me-1 h-3 w-3" />+{offerQuantity} رایگان
                (فقط هزینه ارسال)
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
    const { exchangeRate, discountPercentage, shipment } =
      state.pricingSettings;
    return Math.floor(
      product.price *
        (exchangeRate * 1.05 * (1 - discountPercentage / 100) + shipment),
    );
  };

  return (
    <Card className="flex h-full flex-col text-right transition-shadow hover:shadow-lg">
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
        {/* Price details use justify-between which works correctly in RTL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>قیمت پایه (درهم):</span>
            <span className="font-medium">
              {product.price.toLocaleString("fa-IR")}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>CC:</span>
            <span className="font-medium">
              {product.cc.toLocaleString("fa-IR")}
            </span>
          </div>
          <div className="border-t pt-2">
            <div className="flex items-center justify-between">
              <div className="text-sm">مجموع (تومان):</div>
              <div className="text-left">
                <div className="font-bold">
                  {calculateDisplayPrice().toLocaleString("fa-IR")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Special Offer Section */}
        <div className="space-y-2 rounded-lg border border-orange-200 bg-orange-50 p-3">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`offer-${product.code}`}
              className="text-sm font-medium"
            >
              پیشنهاد ویژه
            </Label>
            <Switch
              id={`offer-${product.code}`}
              checked={offerEnabled}
              onCheckedChange={setOfferEnabled}
              dir="rtl" // Explicitly set direction for the Switch
            />
          </div>
          {offerEnabled && (
            <div className="space-y-2">
              <Label
                htmlFor={`offer-quantity-${product.code}`}
                className="text-xs text-orange-700"
              >
                محصولات اضافی (فقط پرداخت هزینه ارسال):
              </Label>
              <Input
                id={`offer-quantity-${product.code}`}
                type="number"
                min="0"
                value={offerQuantity}
                onChange={(e) =>
                  setOfferQuantity(Math.max(0, parseInt(e.target.value) || 0))
                }
                className="w-full text-right text-sm" // Align number input text to the right
              />
            </div>
          )}
        </div>

        {/* Quantity Section */}
        <div className="space-y-2">
          <Label
            htmlFor={`quantity-${product.code}`}
            className="text-sm font-medium"
          >
            تعداد
          </Label>
          <Input
            id={`quantity-${product.code}`}
            type="number"
            min="0"
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(0, parseInt(e.target.value) || 0))
            }
            className="w-full text-right" // Align number input text to the right
          />
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={handleAddToCart} className="w-full" size="sm">
          <ShoppingCart className="me-2 h-4 w-4" />
          افزودن به سبد خرید
        </Button>
      </CardFooter>
    </Card>
  );
}
