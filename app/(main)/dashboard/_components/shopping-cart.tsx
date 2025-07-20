"use client";

import { CartState, useCart } from "@/contexts/cart-context";
import { ShoppingCart as Cart, Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { CartItem, PricingSettings } from "@/types";

interface CalculateItemTotal {
  item: CartItem;
  pricingSettings: PricingSettings;
}
const calculateItemTotal = ({ item, pricingSettings }: CalculateItemTotal) => {
  const basePriceInToman = item.price * pricingSettings.exchangeRate;
  const totalItemPrice = basePriceInToman * item.quantity;
  const totalItemShipping = item.shipment * item.quantity;
  const offerShipping =
    item.offerEnabled && item.offerQuantity
      ? item.shipment * item.offerQuantity
      : 0;
  const preDiscountTotal = totalItemPrice + totalItemShipping + offerShipping;
  const finalTotal =
    preDiscountTotal * (1 - pricingSettings.discountPercentage / 100);

  return Math.floor(finalTotal);
};

interface CartItemsProps {
  item: CartItem;
  state: CartState;
  updateQuantity: (code: string, quantity: number) => void;
  removeFromCart: (code: string) => void;
}
function CartItems({
  item,
  state,
  updateQuantity,
  removeFromCart,
}: CartItemsProps) {
  const itemTotal = calculateItemTotal({
    item,
    pricingSettings: state.pricingSettings,
  });

  return (
    <div key={item.code} className="space-y-4 rounded-lg border p-3 sm:p-4">
      {/* Item Details and Remove Button */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-medium">{item.product_name}</h4>
          <p className="text-sm text-gray-600">کد: {item.code}</p>
          <p className="text-sm text-gray-600">
            امتیاز:{" "}
            {item.cc.toLocaleString("fa-IR", {
              minimumFractionDigits: 3,
              maximumFractionDigits: 3,
            })}
          </p>
          {item.offerEnabled && item.offerQuantity && (
            <p className="mt-1 text-sm text-green-600">
              +{item.offerQuantity.toLocaleString("fa-IR")} کالای رایگان (فقط
              هزینه ارسال)
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon" // Use "icon" size for a consistent, compact tap area
          onClick={() => removeFromCart(item.code)}
          className="shrink-0 text-red-500 hover:text-red-700"
          aria-label="Remove item"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Responsive container for Quantity and Price */}
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateQuantity(item.code, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) =>
              updateQuantity(
                item.code,
                Math.max(1, parseInt(e.target.value) || 1),
              )
            }
            className="w-16 shrink-0 text-center" // Reduced width for compactness
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateQuantity(item.code, item.quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Item Total Price */}
        <div className="text-left font-semibold sm:text-right">
          <span>{itemTotal.toLocaleString("fa-IR")}</span>
          <span className="mr-1 text-sm font-normal">تومان</span>
        </div>
      </div>
    </div>
  );
}

// Main Shopping Cart Component
export function ShoppingCart() {
  const {
    state,
    updateQuantity,
    removeFromCart,
    getCartSubtotal,
    getCartShipping,
    getCartTotal,
    getTotalCC,
  } = useCart();
  const { items, pricingSettings } = state;

  if (items.length === 0) {
    return (
      <Card className="text-right" dir="rtl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cart className="h-5 w-5" />
            سبد خرید
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-500">
            <Cart className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>سبد خرید شما خالی است</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="text-right" dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cart className="h-5 w-5" />
          سبد خرید ({items.length.toLocaleString("fa-IR")} کالا)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* List of Cart Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <CartItems
              key={item.code}
              item={item}
              state={state}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
            />
          ))}
        </div>

        {/* Cart Summary */}
        <div className="space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="flex justify-between text-sm">
            <span>جمع اقلام:</span>
            <span>{getCartSubtotal().toLocaleString("fa-IR")} تومان</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>هزینه ارسال:</span>
            <span>{getCartShipping().toLocaleString("fa-IR")} تومان</span>
          </div>
          <div className="flex justify-between text-sm text-blue-600">
            <span>مجموع CC:</span>
            <span>{getTotalCC().toLocaleString("fa-IR")}</span>
          </div>
          {pricingSettings.discountPercentage > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>
                تخفیف (
                {pricingSettings.discountPercentage.toLocaleString("fa-IR")}
                %):
              </span>
              <span>
                -
                {Math.floor(
                  ((getCartSubtotal() + getCartShipping()) *
                    pricingSettings.discountPercentage) /
                    100,
                ).toLocaleString("fa-IR")}{" "}
                تومان
              </span>
            </div>
          )}
          <Separator className="my-2" />
          <div className="flex justify-between text-lg font-bold">
            <span>مجموع:</span>
            <span>{getCartTotal().toLocaleString("fa-IR")} تومان</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
