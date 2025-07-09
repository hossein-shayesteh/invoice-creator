"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";

import { Product } from "@prisma/client";

import { CartItem, PricingSettings } from "@/types";

interface CartState {
  items: CartItem[];
  pricingSettings: PricingSettings;
}

type CartAction =
  | {
      type: "ADD_TO_CART";
      payload: {
        product: Product;
        quantity: number;
        offerEnabled: boolean;
        offerQuantity?: number;
      };
    }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { code: string; quantity: number } }
  | { type: "TOGGLE_OFFER"; payload: string }
  | { type: "UPDATE_EXCHANGE_RATE"; payload: number }
  | { type: "UPDATE_DISCOUNT"; payload: number }
  | { type: "CLEAR_CART" };

// Default values if localStorage is not available
const defaultSettings = {
  exchangeRate: 15000, // Default AED to IRR rate
  discountPercentage: 0,
};

// Initialize state with empty values that will be populated in useEffect
const initialState: CartState = {
  items: [],
  pricingSettings: {
    exchangeRate: defaultSettings.exchangeRate,
    discountPercentage: defaultSettings.discountPercentage,
  },
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { product, quantity, offerEnabled, offerQuantity } = action.payload;
      const existingItem = state.items.find(
        (item) => item.code === product.code,
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.code === product.code
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  offerEnabled,
                  offerQuantity,
                }
              : item,
          ),
        };
      }

      return {
        ...state,
        items: [
          ...state.items,
          { ...product, quantity, offerEnabled, offerQuantity },
        ],
      };
    }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        items: state.items.filter((item) => item.code !== action.payload),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.code === action.payload.code
              ? { ...item, quantity: Math.max(0, action.payload.quantity) }
              : item,
          )
          .filter((item) => item.quantity > 0),
      };

    case "TOGGLE_OFFER":
      return {
        ...state,
        items: state.items.map((item) =>
          item.code === action.payload
            ? { ...item, offerEnabled: !item.offerEnabled }
            : item,
        ),
      };

    case "UPDATE_EXCHANGE_RATE":
      return {
        ...state,
        pricingSettings: {
          ...state.pricingSettings,
          exchangeRate: action.payload,
        },
      };

    case "UPDATE_DISCOUNT":
      return {
        ...state,
        pricingSettings: {
          ...state.pricingSettings,
          discountPercentage: action.payload,
        },
      };

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
      };

    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addToCart: (
    product: Product,
    quantity: number,
    offerEnabled: boolean,
    offerQuantity?: number,
  ) => void;
  removeFromCart: (code: string) => void;
  updateQuantity: (code: string, quantity: number) => void;
  toggleOffer: (code: string) => void;
  updateExchangeRate: (rate: number) => void;
  updateDiscount: (discount: number) => void;
  clearCart: () => void;
  getItemTotal: (item: CartItem) => number;
  getCartSubtotal: () => number;
  getCartShipping: () => number;
  getCartTotal: () => number;
  getTotalCC: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load pricing settings from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedExchangeRate = localStorage.getItem("exchangeRate");
        const savedDiscount = localStorage.getItem("discount");

        if (savedExchangeRate) {
          dispatch({
            type: "UPDATE_EXCHANGE_RATE",
            payload: parseFloat(savedExchangeRate),
          });
        }

        if (savedDiscount) {
          dispatch({
            type: "UPDATE_DISCOUNT",
            payload: parseFloat(savedDiscount),
          });
        }
      } catch (error) {
        console.error(
          "Error loading pricing settings from localStorage:",
          error,
        );
      }
    }
  }, []);

  const addToCart = (
    product: Product,
    quantity: number,
    offerEnabled: boolean,
    offerQuantity?: number,
  ) => {
    dispatch({
      type: "ADD_TO_CART",
      payload: { product, quantity, offerEnabled, offerQuantity },
    });
  };

  const removeFromCart = (code: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: code });
  };

  const updateQuantity = (code: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { code, quantity } });
  };

  const toggleOffer = (code: string) => {
    dispatch({ type: "TOGGLE_OFFER", payload: code });
  };

  const updateExchangeRate = (rate: number) => {
    dispatch({ type: "UPDATE_EXCHANGE_RATE", payload: rate });

    // Save to localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("exchangeRate", rate.toString());
      } catch (error) {
        console.error("Error saving exchange rate to localStorage:", error);
      }
    }
  };

  const updateDiscount = (discount: number) => {
    dispatch({ type: "UPDATE_DISCOUNT", payload: discount });
    // Save to localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("discount", discount.toString());
      } catch (error) {
        console.error("Error saving discount to localStorage:", error);
      }
    }
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const getItemTotal = (item: CartItem): number => {
    const { price, quantity, offerEnabled, offerQuantity } = item;
    const { exchangeRate, discountPercentage } = state.pricingSettings;

    // New formula for regular products: quantity * price * (exchangeRate * 1.05 * discount + 2100)
    const regularProductCost = Math.floor(
      quantity *
        price *
        (exchangeRate * 1.05 * (1 - discountPercentage / 100) + 2100),
    );

    // For offer products, we only add shipping cost: offerQuantity * price * 2100
    let offerShippingCost = 0;
    if (offerEnabled && offerQuantity) {
      offerShippingCost = Math.floor(offerQuantity * price * 2100);
    }

    return regularProductCost + offerShippingCost;
  };

  const getCartSubtotal = (): number => {
    return state.items.reduce((total, item) => {
      const { price, quantity } = item;
      const { exchangeRate, discountPercentage } = state.pricingSettings;

      // New formula for regular products: quantity * price * (exchangeRate * 1.05 * discount + 2100)
      const regularProductCost = Math.floor(
        quantity *
          price *
          (exchangeRate * 1.05 * (1 - discountPercentage / 100) + 2100),
      );

      return total + regularProductCost;
    }, 0);
  };

  const getCartShipping = (): number => {
    return state.items.reduce((total, item) => {
      const { price, offerEnabled, offerQuantity } = item;

      // For offer products, we only add shipping cost: offerQuantity * price * 2100
      let offerShippingCost = 0;
      if (offerEnabled && offerQuantity) {
        offerShippingCost = Math.floor(offerQuantity * price * 2100);
      }

      return total + offerShippingCost;
    }, 0);
  };

  const getCartTotal = (): number => {
    // Total is now simply the sum of subtotal (which includes regular product costs) and shipping (which includes offer shipping costs)
    // The discount is already applied in the subtotal calculation
    return getCartSubtotal() + getCartShipping();
  };

  const getTotalCC = (): number => {
    return state.items.reduce((total, item) => {
      const { cc, quantity } = item;

      return total + cc * quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleOffer,
        updateExchangeRate,
        updateDiscount,
        clearCart,
        getItemTotal,
        getCartSubtotal,
        getCartShipping,
        getCartTotal,
        getTotalCC,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
