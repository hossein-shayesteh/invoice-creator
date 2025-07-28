"use client";

import { useEffect, useState } from "react";

import { useCart } from "@/contexts/cart-context";
import { Check, DollarSign, Percent, Settings, Truck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PricingSettings() {
  const { state, updateExchangeRate, updateDiscount, updateShipment } =
    useCart();
  const { pricingSettings } = state;
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasDiscount = localStorage.getItem("discount") !== null;
      const hasShipment = localStorage.getItem("shipment") !== null;
      const hasExchangeRate = localStorage.getItem("exchangeRate") !== null;
      setLoadedFromStorage(hasExchangeRate || hasDiscount || hasShipment);
    }
  }, []);

  return (
    <Card className="text-right" dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          تنظیمات قیمت‌گذاری
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadedFromStorage && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
            <p className="flex items-center text-sm text-green-800">
              <Check className="me-2 size-4" />
              تنظیمات از حافظه محلی بارگذاری شد
            </p>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="exchange-rate" className="flex items-center gap-2">
            <DollarSign className="size-4" />
            نرخ تبدیل ارز (درهم به تومان)
          </Label>
          <Input
            id="exchange-rate"
            type="number"
            min="0"
            step="100"
            value={pricingSettings.exchangeRate}
            onChange={(e) =>
              updateExchangeRate(parseFloat(e.target.value) || 0)
            }
            placeholder="15000"
            className="text-right" // Align input text to the right
          />
          <p className="text-xs text-gray-600">
            نرخ فعلی: 1 درهم ={" "}
            {pricingSettings.exchangeRate.toLocaleString("fa-IR")} تومان
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount" className="flex items-center gap-2">
            <Percent className="size-4" />
            تخفیف کلی (%)
          </Label>
          <Input
            id="discount"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={pricingSettings.discountPercentage}
            onChange={(e) => updateDiscount(parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount" className="flex items-center gap-2">
            <Truck className="size-4" />
            باربری (تومان)
          </Label>
          <Input
            id="shipment"
            type="number"
            min="0"
            value={pricingSettings.shipment}
            onChange={(e) => updateShipment(parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
      </CardContent>
    </Card>
  );
}
