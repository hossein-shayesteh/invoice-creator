"use client";

import { Filter, Search } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFiltersProps {
  searchTerm: string;
  SearchTermAction: (value: string) => void;
  sortBy: string;
  SortByAction: (value: string) => void;
}

export function ProductFilters({
  searchTerm,
  SearchTermAction,
  sortBy,
  SortByAction,
}: ProductFiltersProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle dir="rtl" className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          جستجو و فیلتر محصولات
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row">
        {/* Sort Select */}
        <div className="space-y-2">
          <Label className="block text-right">مرتب‌سازی</Label>

          <Select value={sortBy} onValueChange={SortByAction} dir="rtl">
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="مرتب‌سازی محصولات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">نام (الف تا ی)</SelectItem>
              <SelectItem value="name-desc">نام (ی تا الف)</SelectItem>
              <SelectItem value="price-asc">قیمت (کم به زیاد)</SelectItem>
              <SelectItem value="price-desc">قیمت (زیاد به کم)</SelectItem>
              <SelectItem value="code-asc">کد (الف تا ی)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Input */}
        <div className="flex-1 space-y-2">
          {/* 1. Explicitly align label text to the right */}
          <Label htmlFor="search" className="block text-right">
            جستجوی محصولات
          </Label>
          <div className="relative">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              id="search"
              type="text"
              placeholder="جستجو بر اساس نام محصول یا کد"
              value={searchTerm}
              onChange={(e) => SearchTermAction(e.target.value)}
              className="ps-10 text-right"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
