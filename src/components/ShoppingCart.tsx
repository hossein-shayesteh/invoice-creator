"use client";

import { useCart } from "@/contexts/CartContext";
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cart className="h-5 w-5" />
            Shopping Cart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-500">
            <Cart className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>Your cart is empty</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cart className="h-5 w-5" />
          Shopping Cart ({items.length} items)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.code} className="space-y-3 rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{item.product_name}</h4>
                <p className="text-sm text-gray-600">Code: {item.code}</p>
                <p className="text-sm text-gray-600">
                  Base Price: {item.price.toFixed(2)} AED | CC Points:{" "}
                  {item.cc.toFixed(3)}
                </p>
                <p className="text-sm text-gray-600">
                  Shipment: {item.shipment.toLocaleString()} IRR
                </p>
                {item.offerEnabled && item.offerQuantity && (
                  <p className="text-sm text-green-600">
                    +{item.offerQuantity} free items (shipping only)
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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
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
                  size="sm"
                  onClick={() => updateQuantity(item.code, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500">
                  Qty: {item.quantity}
                  {item.offerEnabled && item.offerQuantity
                    ? ` (+${item.offerQuantity} free)`
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
                  IRR
                </div>
              </div>
            </div>
          </div>
        ))}

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{getCartSubtotal().toLocaleString()} IRR</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping:</span>
            <span>{getCartShipping().toLocaleString()} IRR</span>
          </div>
          <div className="flex justify-between text-sm text-blue-600">
            <span>Total CC Points:</span>
            <span>{getTotalCC().toFixed(3)}</span>
          </div>
          {state.pricingSettings.discountPercentage > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>
                Discount ({state.pricingSettings.discountPercentage}%):
              </span>
              <span>
                -
                {Math.floor(
                  ((getCartSubtotal() + getCartShipping()) *
                    state.pricingSettings.discountPercentage) /
                    100,
                ).toLocaleString()}{" "}
                IRR
              </span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>{getCartTotal().toLocaleString()} IRR</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
