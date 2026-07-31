import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("../../../utils", () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    cartKey: vi.fn(),
    wishlistKey: vi.fn((id: string | undefined) => `siddha_wishlist_${id || "guest"}`),
  },
}));

import { useWishlist } from "../../../hooks/useWishlist";
import { storage } from "../../../utils";

describe("useWishlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (storage.get as vi.Mock).mockReturnValue(null);
  });

  it("initializes with empty wishlist", () => {
    const { result } = renderHook(() => useWishlist("user-1"));
    expect(result.current.wishlist).toEqual([]);
  });

  it("restores wishlist from localStorage", () => {
    (storage.get as vi.Mock).mockReturnValue(["prod-1", "prod-2"]);
    const { result } = renderHook(() => useWishlist("user-1"));
    expect(result.current.wishlist).toEqual(["prod-1", "prod-2"]);
  });

  it("toggleWishlist adds a product id", () => {
    const { result } = renderHook(() => useWishlist("user-1"));
    act(() => {
      result.current.toggleWishlist("prod-1");
    });
    expect(result.current.wishlist).toEqual(["prod-1"]);
  });

  it("toggleWishlist removes an existing product id", () => {
    const { result } = renderHook(() => useWishlist("user-1"));
    act(() => {
      result.current.toggleWishlist("prod-1");
    });
    act(() => {
      result.current.toggleWishlist("prod-1");
    });
    expect(result.current.wishlist).toEqual([]);
  });

  it("toggleWishlist adds multiple product ids", () => {
    const { result } = renderHook(() => useWishlist("user-1"));
    act(() => {
      result.current.toggleWishlist("prod-1");
    });
    act(() => {
      result.current.toggleWishlist("prod-2");
    });
    act(() => {
      result.current.toggleWishlist("prod-3");
    });
    expect(result.current.wishlist).toEqual(["prod-1", "prod-2", "prod-3"]);
  });

  it("isInWishlist returns true for items in wishlist", () => {
    const { result } = renderHook(() => useWishlist("user-1"));
    act(() => {
      result.current.toggleWishlist("prod-1");
    });
    expect(result.current.isInWishlist("prod-1")).toBe(true);
  });

  it("isInWishlist returns false for items not in wishlist", () => {
    const { result } = renderHook(() => useWishlist("user-1"));
    expect(result.current.isInWishlist("nonexistent")).toBe(false);
  });

  it("persists wishlist to localStorage on change", () => {
    const { result } = renderHook(() => useWishlist("user-1"));
    act(() => {
      result.current.toggleWishlist("prod-1");
    });
    expect(storage.set).toHaveBeenCalledWith(
      "siddha_wishlist_user-1",
      ["prod-1"]
    );
  });

  it("uses correct key for guest users", () => {
    const { result } = renderHook(() => useWishlist(undefined));
    act(() => {
      result.current.toggleWishlist("prod-1");
    });
    expect(storage.set).toHaveBeenCalledWith(
      "siddha_wishlist_guest",
      ["prod-1"]
    );
  });

  it("isInWishlist is reactive after toggle", () => {
    const { result } = renderHook(() => useWishlist("user-1"));
    expect(result.current.isInWishlist("prod-1")).toBe(false);
    act(() => {
      result.current.toggleWishlist("prod-1");
    });
    expect(result.current.isInWishlist("prod-1")).toBe(true);
    act(() => {
      result.current.toggleWishlist("prod-1");
    });
    expect(result.current.isInWishlist("prod-1")).toBe(false);
  });
});