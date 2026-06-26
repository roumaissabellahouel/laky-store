"use client";

import { useState, useEffect, useCallback } from "react";
import { CartItem, Cart } from "@/types";

const CART_KEY = "laky_cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function computeCart(items: CartItem[]): Cart {
  return {
    items,
    total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    count: items.reduce((sum, i) => sum + i.quantity, 0),
  };
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  const updateItems = useCallback((next: CartItem[]) => {
    setItems(next);
    saveCart(next);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      setItems((prev) => {
        const qty = item.quantity ?? 1;
        const existing = prev.find((i) => i.productId === item.productId);
        const next = existing
          ? prev.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + qty }
                : i
            )
          : [...prev, { ...item, quantity: qty }];
        saveCart(next);
        return next;
      });
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId);
      saveCart(next);
      return next;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) => {
      const next = prev.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      );
      saveCart(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    updateItems([]);
  }, [updateItems]);

  return {
    ...computeCart(items),
    hydrated,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
