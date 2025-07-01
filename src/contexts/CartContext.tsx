'use client';

import { CartItem, PricingSettings, Product } from '@/types';
import { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';

interface CartState {
  items: CartItem[];
  pricingSettings: PricingSettings;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity: number; offerEnabled: boolean } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { code: string; quantity: number } }
  | { type: 'TOGGLE_OFFER'; payload: string }
  | { type: 'UPDATE_EXCHANGE_RATE'; payload: number }
  | { type: 'UPDATE_DISCOUNT'; payload: number }
  | { type: 'CLEAR_CART' };

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
    case 'ADD_TO_CART': {
      const { product, quantity, offerEnabled } = action.payload;
      const existingItem = state.items.find(item => item.code === product.code);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.code === product.code
              ? { ...item, quantity: item.quantity + quantity, offerEnabled }
              : item
          ),
        };
      }
      
      return {
        ...state,
        items: [...state.items, { ...product, quantity, offerEnabled }],
      };
    }
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.code !== action.payload),
      };
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.code === action.payload.code
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        ).filter(item => item.quantity > 0),
      };
    
    case 'TOGGLE_OFFER':
      return {
        ...state,
        items: state.items.map(item =>
          item.code === action.payload
            ? { ...item, offerEnabled: !item.offerEnabled }
            : item
        ),
      };
    
    case 'UPDATE_EXCHANGE_RATE':
      return {
        ...state,
        pricingSettings: {
          ...state.pricingSettings,
          exchangeRate: action.payload,
        },
      };
    
    case 'UPDATE_DISCOUNT':
      return {
        ...state,
        pricingSettings: {
          ...state.pricingSettings,
          discountPercentage: action.payload,
        },
      };
    
    case 'CLEAR_CART':
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
  addToCart: (product: Product, quantity: number, offerEnabled: boolean) => void;
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  // Load pricing settings from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedExchangeRate = localStorage.getItem('exchangeRate');
        const savedDiscount = localStorage.getItem('discount');
        
        if (savedExchangeRate) {
          dispatch({ 
            type: 'UPDATE_EXCHANGE_RATE', 
            payload: parseFloat(savedExchangeRate) 
          });
        }
        
        if (savedDiscount) {
          dispatch({ 
            type: 'UPDATE_DISCOUNT', 
            payload: parseFloat(savedDiscount) 
          });
        }
      } catch (error) {
        console.error('Error loading pricing settings from localStorage:', error);
      }
    }
  }, []);

  const addToCart = (product: Product, quantity: number, offerEnabled: boolean) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity, offerEnabled } });
  };

  const removeFromCart = (code: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: code });
  };

  const updateQuantity = (code: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { code, quantity } });
  };

  const toggleOffer = (code: string) => {
    dispatch({ type: 'TOGGLE_OFFER', payload: code });
  };

  const updateExchangeRate = (rate: number) => {
    dispatch({ type: 'UPDATE_EXCHANGE_RATE', payload: rate });
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('exchangeRate', rate.toString());
      } catch (error) {
        console.error('Error saving exchange rate to localStorage:', error);
      }
    }
  };

  const updateDiscount = (discount: number) => {
    dispatch({ type: 'UPDATE_DISCOUNT', payload: discount });
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('discount', discount.toString());
      } catch (error) {
        console.error('Error saving discount to localStorage:', error);
      }
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemTotal = (item: CartItem): number => {
    const { price, quantity, offerEnabled, offer, cc } = item;
    const { exchangeRate, discountPercentage } = state.pricingSettings;
    
    let effectiveQuantity = quantity;
    let shippingCost = cc * quantity * exchangeRate;
    
    if (offerEnabled && offer) {
      // Customer gets 'offer' products for the price of 1
      effectiveQuantity = Math.ceil(quantity / offer);
      // But shipping applies to all items
      shippingCost = cc * quantity * exchangeRate;
    }
    
    const productCost = price * effectiveQuantity * exchangeRate;
    const subtotal = productCost + shippingCost;
    const discountAmount = (subtotal * discountPercentage) / 100;
    
    return subtotal - discountAmount;
  };

  const getCartSubtotal = (): number => {
    return state.items.reduce((total, item) => {
      const { price, quantity, offerEnabled, offer } = item;
      const { exchangeRate } = state.pricingSettings;
      
      let effectiveQuantity = quantity;
      if (offerEnabled && offer) {
        effectiveQuantity = Math.ceil(quantity / offer);
      }
      
      return total + (price * effectiveQuantity * exchangeRate);
    }, 0);
  };

  const getCartShipping = (): number => {
    return state.items.reduce((total, item) => {
      const { cc, quantity } = item;
      const { exchangeRate } = state.pricingSettings;
      return total + (cc * quantity * exchangeRate);
    }, 0);
  };

  const getCartTotal = (): number => {
    const subtotal = getCartSubtotal();
    const shipping = getCartShipping();
    const total = subtotal + shipping;
    const discountAmount = (total * state.pricingSettings.discountPercentage) / 100;
    return total - discountAmount;
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}