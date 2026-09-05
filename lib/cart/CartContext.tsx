'use client';

import { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { loadCart, saveCart } from '@/lib/cart/storage';
import { buildLineId, cartItemLineTotal, type CartItem } from '@/lib/cart/types';

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'HYDRATE'; items: CartItem[] }
  | { type: 'ADD'; item: Omit<CartItem, 'lineId'> & { addonOptionIds: string[] } }
  | { type: 'UPDATE_QUANTITY'; lineId: string; quantity: number }
  | { type: 'REMOVE'; lineId: string }
  | { type: 'CLEAR' };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { items: action.items };

    case 'ADD': {
      const lineId = buildLineId(
        action.item.productId,
        action.item.variantId,
        action.item.addonOptionIds,
      );
      const { addonOptionIds: _addonOptionIds, ...itemWithoutHelper } = action.item;
      const existing = state.items.find((i) => i.lineId === lineId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.lineId === lineId ? { ...i, quantity: i.quantity + action.item.quantity } : i,
          ),
        };
      }
      return { items: [...state.items, { ...itemWithoutHelper, lineId }] };
    }

    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => i.lineId !== action.lineId) };
      }
      return {
        items: state.items.map((i) =>
          i.lineId === action.lineId ? { ...i, quantity: action.quantity } : i,
        ),
      };

    case 'REMOVE':
      return { items: state.items.filter((i) => i.lineId !== action.lineId) };

    case 'CLEAR':
      return { items: [] };

    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  /** True once the client has read localStorage — lets the cart badge avoid a
   *  hydration-mismatch flash between "0" (server) and the real saved count. */
  isHydrated: boolean;
  addItem: (item: Omit<CartItem, 'lineId'> & { addonOptionIds: string[] }) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const [isHydrated, setIsHydrated] = useState(false);

  // Read any previously-saved cart once, on mount (client only).
  useEffect(() => {
    dispatch({ type: 'HYDRATE', items: loadCart() });
    setIsHydrated(true);
  }, []);

  // Persist on every change, but not the initial pre-hydration render (which
  // would otherwise overwrite a saved cart with an empty one for a instant).
  useEffect(() => {
    if (isHydrated) saveCart(state.items);
  }, [state.items, isHydrated]);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + cartItemLineTotal(i), 0);

  const value: CartContextValue = {
    items: state.items,
    itemCount,
    subtotal,
    isHydrated,
    addItem: (item) => dispatch({ type: 'ADD', item }),
    updateQuantity: (lineId, quantity) => dispatch({ type: 'UPDATE_QUANTITY', lineId, quantity }),
    removeItem: (lineId) => dispatch({ type: 'REMOVE', lineId }),
    clearCart: () => dispatch({ type: 'CLEAR' }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within <CartProvider>.');
  return ctx;
}
