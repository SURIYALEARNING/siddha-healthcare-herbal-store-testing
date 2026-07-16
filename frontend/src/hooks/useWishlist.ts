import { useState, useCallback, useEffect } from "react";
import { storage } from "../utils";

export function useWishlist(userId: string | undefined) {
  const [wishlist, setWishlist] = useState<string[]>(() => {
    return storage.get<string[]>(storage.wishlistKey(userId)) || [];
  });

  useEffect(() => {
    storage.set(storage.wishlistKey(userId), wishlist);
  }, [wishlist, userId]);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  return { wishlist, setWishlist, toggleWishlist, isInWishlist };
}
