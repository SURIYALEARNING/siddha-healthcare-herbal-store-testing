export const STORAGE_KEYS = {
  USER: "siddha_user",
  ACCESS_TOKEN: "accessToken",
  CART_PREFIX: "siddha_cart_",
  WISHLIST_PREFIX: "siddha_wishlist_",
  GUEST: "guest",
} as const;

export const STATUS = ["Ordered", "Packed", "Shipped", "Out for Delivery", "Delivered"] as const;

export const PAYMENT_METHODS = ["Cash on Delivery", "Online Payment"] as const;

export const CATEGORIES = [
  "All",
  "Herbal Supplements",
  "Ayurvedic Oils",
  "Skin Care",
  "Hair Care",
  "Health Tonics",
  "Digestive Care",
  "Immunity Boosters",
] as const;
