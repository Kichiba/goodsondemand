import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CartItem } from '@shared/types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem, maxStock: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number, maxStock?: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'shop-cart';

function loadCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addItem = (newItem: CartItem, maxStock: number) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === newItem.productId);
      if (existing) {
        const newQty = Math.min(existing.quantity + newItem.quantity, maxStock);
        return prev.map((item) =>
          item.productId === newItem.productId
            ? { ...item, quantity: newQty }
            : item
        );
      }
      const clampedQty = Math.min(newItem.quantity, maxStock);
      return [...prev, { ...newItem, quantity: clampedQty }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number, maxStock?: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    const finalQty = maxStock ? Math.min(quantity, maxStock) : quantity;
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: finalQty } : item
      )
    );
  };

  const getItemQuantity = (productId: string) => {
    const item = items.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalAmount, getItemQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
