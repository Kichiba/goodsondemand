import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CartItem } from '@shared/types';

// A cart line is uniquely identified by product AND payment mode, so the
// same product can appear once as a full purchase and once as layaway.
function lineKey(productId: string, mode: CartItem['paymentMode']): string {
  return `${productId}__${mode || 'full'}`;
}

// What the customer pays now for a single cart line.
// Full payment -> full price. Layaway -> first payday installment.
export function lineDueNow(item: CartItem): number {
  if (item.paymentMode === 'layaway' && item.paydayAmount) {
    return item.paydayAmount * item.quantity;
  }
  return item.price * item.quantity;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem, maxStock: number) => void;
  removeItem: (productId: string, mode?: CartItem['paymentMode']) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    maxStock?: number,
    mode?: CartItem['paymentMode']
  ) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;   // Full value of all items
  amountDueNow: number;  // What the customer pays up front
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
    const key = lineKey(newItem.productId, newItem.paymentMode);
    setItems((prev) => {
      const existing = prev.find(
        (item) => lineKey(item.productId, item.paymentMode) === key
      );
      if (existing) {
        const newQty = Math.min(existing.quantity + newItem.quantity, maxStock);
        return prev.map((item) =>
          lineKey(item.productId, item.paymentMode) === key
            ? { ...item, quantity: newQty }
            : item
        );
      }
      const clampedQty = Math.min(newItem.quantity, maxStock);
      return [...prev, { ...newItem, quantity: clampedQty }];
    });
  };

  const removeItem = (productId: string, mode?: CartItem['paymentMode']) => {
    const key = lineKey(productId, mode);
    setItems((prev) =>
      prev.filter((item) => lineKey(item.productId, item.paymentMode) !== key)
    );
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    maxStock?: number,
    mode?: CartItem['paymentMode']
  ) => {
    if (quantity <= 0) {
      removeItem(productId, mode);
      return;
    }
    const key = lineKey(productId, mode);
    const finalQty = maxStock ? Math.min(quantity, maxStock) : quantity;
    setItems((prev) =>
      prev.map((item) =>
        lineKey(item.productId, item.paymentMode) === key
          ? { ...item, quantity: finalQty }
          : item
      )
    );
  };

  // Total quantity of a product across all payment modes (for stock limits).
  const getItemQuantity = (productId: string) => {
    return items
      .filter((i) => i.productId === productId)
      .reduce((sum, i) => sum + i.quantity, 0);
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const amountDueNow = items.reduce((sum, item) => sum + lineDueNow(item), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        amountDueNow,
        getItemQuantity,
      }}
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
