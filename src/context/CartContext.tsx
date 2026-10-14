"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Product } from "@/lib/data";
import {
  penceToPounds,
  calculateItemPricing,
  LineItemPricing,
} from "@/lib/currency";

export interface CartCustomisation {
  size?: string;
  sizePrice?: number;
  flavour?: string;
  sauce?: string;
  extras: { id: string; name: string; price: number }[];
  specialInstructions?: string;
  quantity: number;
}

export interface CartItem {
  cartId: string; // unique per distinct customisation
  product: Product;
  customisation: CartCustomisation;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { cartId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_OPEN"; payload: boolean }
  | { type: "HYDRATE"; payload: CartItem[] };

function getCustomisationSignature(productId: string, c: CartCustomisation): string {
  const sortedExtras = [...(c.extras || [])].map((e) => e.id).sort().join(",");
  const instructions = (c.specialInstructions || "").trim().toLowerCase();
  return `${productId}|${c.size || ""}|${c.flavour || ""}|${c.sauce || ""}|${sortedExtras}|${instructions}`;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const newSignature = getCustomisationSignature(
        action.payload.product.id,
        action.payload.customisation
      );

      // Check if an existing item has the EXACT same customisations
      const existingIndex = state.items.findIndex(
        (i) => getCustomisationSignature(i.product.id, i.customisation) === newSignature
      );

      if (existingIndex > -1) {
        // Increment quantity of existing line item
        const updatedItems = [...state.items];
        const existing = updatedItems[existingIndex];
        const newQty = existing.customisation.quantity + action.payload.customisation.quantity;
        updatedItems[existingIndex] = {
          ...existing,
          customisation: {
            ...existing.customisation,
            quantity: newQty,
          },
        };
        return { ...state, items: updatedItems };
      }

      // Different customisation: add as distinct line item
      return { ...state, items: [...state.items, action.payload] };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.cartId !== action.payload),
      };
    case "UPDATE_QUANTITY": {
      const { cartId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.cartId !== cartId),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.cartId === cartId
            ? { ...i, customisation: { ...i.customisation, quantity } }
            : i
        ),
      };
    }
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "SET_OPEN":
      return { ...state, isOpen: action.payload };
    case "HYDRATE":
      return { ...state, items: action.payload };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, customisation: CartCustomisation) => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  itemCount: number;
  subtotal: number;
  subtotalPence: number;
  getItemPricing: (item: CartItem) => LineItemPricing;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "cravebox-cart-v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });
  const isHydrated = useRef(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", payload: parsed });
        }
      }
    } catch {
      // LocalStorage access errors ignored in private mode
    } finally {
      isHydrated.current = true;
    }
  }, []);

  // Persist to localStorage on change, only after hydration is complete
  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // ignore
    }
  }, [state.items]);

  const addItem = useCallback(
    (product: Product, customisation: CartCustomisation) => {
      const cartId = `cb-${product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      dispatch({ type: "ADD_ITEM", payload: { cartId, product, customisation } });
      dispatch({ type: "SET_OPEN", payload: true });
    },
    []
  );

  const removeItem = useCallback((cartId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: cartId });
  }, []);

  const updateQuantity = useCallback((cartId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { cartId, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const openCart = useCallback(() => {
    dispatch({ type: "SET_OPEN", payload: true });
  }, []);

  const closeCart = useCallback(() => {
    dispatch({ type: "SET_OPEN", payload: false });
  }, []);

  const itemCount = useMemo(
    () => state.items.reduce((sum, item) => sum + item.customisation.quantity, 0),
    [state.items]
  );

  const getItemPricing = useCallback((item: CartItem): LineItemPricing => {
    return calculateItemPricing(
      item.product.price,
      item.customisation.sizePrice ?? 0,
      item.customisation.extras,
      item.customisation.quantity
    );
  }, []);

  // Strict integer pence calculation for subtotal
  const subtotalPence = useMemo(() => {
    return state.items.reduce((sum, item) => {
      const pricing = calculateItemPricing(
        item.product.price,
        item.customisation.sizePrice ?? 0,
        item.customisation.extras,
        item.customisation.quantity
      );
      return sum + pricing.totalPence;
    }, 0);
  }, [state.items]);

  const subtotal = useMemo(() => penceToPounds(subtotalPence), [subtotalPence]);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        itemCount,
        subtotal,
        subtotalPence,
        getItemPricing,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
