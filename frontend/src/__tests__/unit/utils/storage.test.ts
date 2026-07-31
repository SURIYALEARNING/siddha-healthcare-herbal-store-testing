import { describe, it, expect, beforeEach, vi } from "vitest";
import { storage } from "../../../utils/storage";
import { STORAGE_KEYS } from "../../../constants";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("set", () => {
    it("stores a string value", () => {
      storage.set("key", "value");
      expect(localStorage.getItem("key")).toBe("value");
    });

    it("stores an object as JSON", () => {
      const obj = { a: 1, b: "two" };
      storage.set("key", obj);
      expect(localStorage.getItem("key")).toBe(JSON.stringify(obj));
    });

    it("stores a number", () => {
      storage.set("key", 42);
      expect(localStorage.getItem("key")).toBe("42");
    });

    it("stores an array", () => {
      const arr = [1, 2, 3];
      storage.set("key", arr);
      expect(JSON.parse(localStorage.getItem("key")!)).toEqual(arr);
    });
  });

  describe("get", () => {
    it("retrieves a stored object", () => {
      const obj = { name: "test" };
      localStorage.setItem("key", JSON.stringify(obj));
      expect(storage.get<typeof obj>("key")).toEqual(obj);
    });

    it("returns null for missing key", () => {
      expect(storage.get("nonexistent")).toBeNull();
    });

    it("returns null when JSON is malformed", () => {
      localStorage.setItem("bad", "{invalid json}");
      expect(storage.get("bad")).toBeNull();
    });

    it("returns null when value is literal null", () => {
      localStorage.setItem("nullval", "null");
      expect(storage.get("nullval")).toBeNull();
    });
  });

  describe("remove", () => {
    it("removes a key from localStorage", () => {
      localStorage.setItem("key", "value");
      storage.remove("key");
      expect(localStorage.getItem("key")).toBeNull();
    });

    it("does not throw when removing a missing key", () => {
      expect(() => storage.remove("missing")).not.toThrow();
    });
  });

  describe("cartKey", () => {
    it("generates key with user id", () => {
      const key = storage.cartKey("user123");
      expect(key).toBe(`${STORAGE_KEYS.CART_PREFIX}user123`);
    });

    it("generates guest key when userId is undefined", () => {
      const key = storage.cartKey(undefined);
      expect(key).toBe(`${STORAGE_KEYS.CART_PREFIX}${STORAGE_KEYS.GUEST}`);
    });
  });

  describe("wishlistKey", () => {
    it("generates key with user id", () => {
      const key = storage.wishlistKey("user123");
      expect(key).toBe(`${STORAGE_KEYS.WISHLIST_PREFIX}user123`);
    });

    it("generates guest key when userId is undefined", () => {
      const key = storage.wishlistKey(undefined);
      expect(key).toBe(`${STORAGE_KEYS.WISHLIST_PREFIX}${STORAGE_KEYS.GUEST}`);
    });
  });

  describe("edge cases", () => {
    it("handles localStorage setItem throwing gracefully", () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("quota exceeded");
      });
      storage.set("key", "value");
      expect(setItemSpy).toHaveBeenCalled();
      setItemSpy.mockRestore();
      spy.mockRestore();
    });

    it("handles null value passed to set", () => {
      storage.set("key", null);
      expect(localStorage.getItem("key")).toBe("null");
    });
  });
});