'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart as Cart, Minus, Package, Plus, Trash2 } from 'lucide-react';

export function ShoppingCart() {
  const {
    state,
    updateQuantity,
    removeFromCart,
    toggleOffer,
    getCartSubtotal,
    getCartShipping,
    getCartTotal,
  } = useCart();

  const { items } = state;

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cart className="w-5 h-5" />
            Shopping Cart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Cart className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
          <Cart className="w-5 h-5" />
          Shopping Cart ({items.length} items)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.code} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium">{item.product_name}</h4>
                <p className="text-sm text-gray-600">Code: {item.code}</p>
                <p className="text-sm text-gray-600">
                  Base Price: {item.price.toFixed(2)} AED | Shipping: {item.cc.toFixed(3)} CC
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFromCart(item.code)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {item.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`cart-offer-${item.code}`}
                  checked={item.offerEnabled}
                  onChange={() => toggleOffer(item.code)}
                  className="rounded"
                />
                <label htmlFor={`cart-offer-${item.code}`} className="text-sm">
                  Enable Offer
                </label>
                <Badge variant="destructive" className="text-xs">
                  {item.offer} for 1
                </Badge>
                {item.offerEnabled && (
                  <div className="text-xs text-green-600 flex items-center">
                    <Package className="w-3 h-3 mr-1" />
                    Offer Active!
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.code, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.code, Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.code, item.quantity + 1)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="text-right">
                {item.offerEnabled && item.offer ? (
                  <div>
                    <div className="text-sm text-gray-500">
                      Qty: {item.quantity} → Pay for: {Math.ceil(item.quantity / item.offer)}
                    </div>
                    <div className="font-medium text-green-600">
                      {Math.floor((item.price * Math.ceil(item.quantity / item.offer) + item.cc * item.quantity) * state.pricingSettings.exchangeRate * (1 - state.pricingSettings.discountPercentage / 100)).toLocaleString()} IRR
                    </div>
                  </div>
                ) : (
                  <div className="font-medium">
                    {Math.floor((item.price * item.quantity + item.cc * item.quantity) * state.pricingSettings.exchangeRate * (1 - state.pricingSettings.discountPercentage / 100)).toLocaleString()} IRR
                  </div>
                )}
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
          {state.pricingSettings.discountPercentage > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount ({state.pricingSettings.discountPercentage}%):</span>
              <span>-{Math.floor(((getCartSubtotal() + getCartShipping()) * state.pricingSettings.discountPercentage) / 100).toLocaleString()} IRR</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>{getCartTotal().toLocaleString()} IRR</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}