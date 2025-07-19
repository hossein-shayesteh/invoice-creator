"use client";

import { useCart } from "@/contexts/cart-context";
import { ShoppingCart as Cart, Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

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

  const { items } = state;

  if (items.length === 0) {
    return (
      <Card dir="rtl">
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
    <Card dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cart className="h-5 w-5" />
          سبد خرید ({items.length} کالا)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.code} className="space-y-3 rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{item.product_name}</h4>
                <p className="text-sm text-gray-600">کد: {item.code}</p>
                <p className="text-sm text-gray-600">
                  قیمت پایه: {item.price.toFixed(2)} درهم | امتیازات CC:{" "}
                  {item.cc.toFixed(3)}
                </p>

                {item.offerEnabled && item.offerQuantity && (
                  <p className="text-sm text-green-600">
                    +{item.offerQuantity} کالای رایگان (فقط هزینه ارسال)
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFromCart(item.code)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.code, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
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
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.code, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500">
                  Qty: {item.quantity}
                  {item.offerEnabled && item.offerQuantity
                    ? ` (+${item.offerQuantity} رایگان)`
                    : ""}
                </div>
                <div className="font-medium">
                  {Math.floor(
                    (item.price *
                      item.quantity *
                      state.pricingSettings.exchangeRate +
                      item.shipment * item.quantity +
                      (item.offerEnabled && item.offerQuantity
                        ? item.shipment * item.offerQuantity
                        : 0)) *
                      (1 - state.pricingSettings.discountPercentage / 100),
                  ).toLocaleString()}{" "}
                  تومان
                </div>
              </div>
            </div>
          </div>
        ))}

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>جمع جزء:</span>
            <span>{getCartSubtotal().toLocaleString()} تومان</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>هزینه ارسال:</span>
            <span>{getCartShipping().toLocaleString()} تومان</span>
          </div>
          <div className="flex justify-between text-sm text-blue-600">
            <span>مجموع امتیازات CC:</span>
            <span>{getTotalCC().toFixed(3)}</span>
          </div>
          {state.pricingSettings.discountPercentage > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>تخفیف ({state.pricingSettings.discountPercentage}%):</span>
              <span>
                -
                {Math.floor(
                  ((getCartSubtotal() + getCartShipping()) *
                    state.pricingSettings.discountPercentage) /
                    100,
                ).toLocaleString()}{" "}
                تومان
              </span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>مجموع:</span>
            <span>{getCartTotal().toLocaleString()} تومان</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
