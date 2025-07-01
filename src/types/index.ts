export interface Product {
  code: string;
  product_name: string;
  cc: number;
  price: number;
  offer?: number;
}

export interface CartItem extends Product {
  quantity: number;
  offerEnabled: boolean;
}

export interface Invoice {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  exchangeRate: number;
}

export interface PricingSettings {
  exchangeRate: number; // AED to IRR
  discountPercentage: number;
}