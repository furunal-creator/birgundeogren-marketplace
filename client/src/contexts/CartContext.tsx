import { createContext, useContext, useState, useCallback } from "react";

export interface CartItem {
  id: number; // course id
  code: string;
  title: string;
  price: number;
  priceFormatted: string;
  imageUrl: string;
  format: string;
  durationHours: number;
  instructorName: string;
  category?: { name: string; color: string };
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (courseId: number) => void;
  clearCart: () => void;
  isInCart: (courseId: number) => boolean;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      if (prev.some(i => i.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((courseId: number) => {
    setItems(prev => prev.filter(i => i.id !== courseId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback((courseId: number) => {
    return items.some(i => i.id === courseId);
  }, [items]);

  const total = items.reduce((sum, item) => sum + item.price, 0);
  const count = items.length;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, isInCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
