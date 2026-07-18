import { useState, useCallback, useEffect } from "react";
import { CartItem, Product } from "../types";
import { addToCartApi, updateCartQuantityApi, removeFromCartApi, clearCartApi, syncCartApi, fetchCartApi } from "../api";
import { storage } from "../utils";
import { STORAGE_KEYS } from "../constants";

function clampQuantity(quantity: number, stock: number): number {
  return Math.max(1, Math.min(stock, quantity));
}

function buildItem(product: Product, quantity: number): CartItem {
  return {
    productId: product._id,
    name: product.name,
    price: product.price,
    discountPrice: product.discountPrice,
    quantity: clampQuantity(quantity, product.stock),
    image: product.images[0],
  };
}

export function useCart(userId: string | undefined) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    return storage.get<CartItem[]>(storage.cartKey(userId)) || [];
  });

  useEffect(() => {
    storage.set(storage.cartKey(userId), cart);
  }, [cart, userId]);

  const loadServerCart = useCallback(async () => {
    if (!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) {
      const saved = storage.get<CartItem[]>(storage.cartKey(userId));
      if (saved) setCart(saved);
      return;
    }

    try {
      const data = await fetchCartApi();
      setCart(data.items || []);
    } catch {
      const saved = storage.get<CartItem[]>(storage.cartKey(userId));
      if (saved) setCart(saved);
    }
  }, [userId]);

  const addToCart = useCallback(async (product: Product, quantity: number = 1, isLoggedIn: boolean) => {
    const item = buildItem(product, quantity);
    setCart(prev => {
      const existing = prev.find(i => i.productId === product._id);
      if (existing) {
        return prev.map(i =>
          i.productId === product._id
            ? { ...i, quantity: clampQuantity(i.quantity + quantity, product.stock) }
            : i
        );
      }
      return [...prev, item];
    });
    if (isLoggedIn) {
      try { await addToCartApi(item); } catch { /* optimistic */ }
    }
  }, []);

  const updateQuantity = useCallback(async (productId: string, quantity: number, stock: number, isLoggedIn: boolean) => {
    const clamped = clampQuantity(quantity, stock);
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: clamped } : i));
    if (isLoggedIn) {
      try { await updateCartQuantityApi(productId, clamped); } catch { /* optimistic */ }
    }
  }, []);

  const removeFromCart = useCallback(async (productId: string, isLoggedIn: boolean) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
    if (isLoggedIn) {
      try { await removeFromCartApi(productId); } catch { /* optimistic */ }
    }
  }, []);

  const clearCart = useCallback(async (isLoggedIn: boolean) => {
    setCart([]);
    if (isLoggedIn) {
      try { await clearCartApi(); } catch { /* optimistic */ }
    }
  }, []);

  const syncGuestCart = useCallback(async () => {
    const guestCart = storage.get<CartItem[]>(storage.cartKey(undefined));
    if (guestCart && guestCart.length > 0) {
      try {
        const synced = await syncCartApi(guestCart);
        setCart(synced.items || []);
      } catch {
        setCart(guestCart);
      }
      storage.set(storage.cartKey(undefined), []);
    }
  }, []);

  return { cart, setCart, addToCart, updateQuantity, removeFromCart, clearCart, loadServerCart, syncGuestCart };
}
