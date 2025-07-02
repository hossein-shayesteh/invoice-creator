export interface Product {
  id: number;
  code: string;
  product_name: string;
  cc: number;
  price: number;
  shipment: number;
}

export interface CartItem extends Product {
  quantity: number;
  offerEnabled: boolean;
  offerQuantity?: number;
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
  totalCC: number;
}

export interface PricingSettings {
  exchangeRate: number; // AED to IRR
  discountPercentage: number;
}
