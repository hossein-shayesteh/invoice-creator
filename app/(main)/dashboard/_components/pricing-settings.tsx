"use client";

import { useEffect, useState } from "react";

import { useCart } from "@/contexts/cart-context";
import { DollarSign, Percent, Settings } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PricingSettings() {
  const { state, updateExchangeRate, updateDiscount } = useCart();
  const { pricingSettings } = state;
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasExchangeRate = localStorage.getItem("exchangeRate") !== null;
      const hasDiscount = localStorage.getItem("discount") !== null;
      setLoadedFromStorage(hasExchangeRate || hasDiscount);
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="me-2 h-4 w-4" // Use margin-end for RTL
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              تنظیمات از حافظه محلی بارگذاری شد
            </p>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="exchange-rate" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
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
            <Percent className="h-4 w-4" />
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
      </CardContent>
    </Card>
  );
}
