import { STORAGE_KEYS } from "../constants";

export const storage = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      const raw = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, raw);
    } catch {
      console.warn("Failed to save to localStorage:", key);
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },

  cartKey(userId: string | undefined): string {
    return `${STORAGE_KEYS.CART_PREFIX}${userId || STORAGE_KEYS.GUEST}`;
  },

  wishlistKey(userId: string | undefined): string {
    return `${STORAGE_KEYS.WISHLIST_PREFIX}${userId || STORAGE_KEYS.GUEST}`;
  },
};
