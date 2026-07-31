import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
  };
});

import { useShopFilters } from "../../../hooks/useShopFilters";

function makeProduct(id: string, name: string | any, category: string | any, price: number, discountPrice: number, rating = 4) {
  return {
    _id: id,
    name,
    category,
    price,
    discountPrice,
    stock: 10,
    images: [],
    reviewStats: { averageRating: rating, totalReviews: 5 },
  } as any;
}

const products = [
  makeProduct("p1", "Herbal Tea", "Beverages", 100, 90, 4.5),
  makeProduct("p2", "Ayurvedic Oil", "Oils", 300, 280, 4.0),
  makeProduct("p3", "Tulsi Drops", "Supplements", 50, 45, 3.5),
  makeProduct("p4", "Ashwagandha", "Supplements", 200, 180, 5.0),
];

describe("useShopFilters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it("initially shows all products", () => {
    const { result } = renderHook(() => useShopFilters(products, "en"));
    expect(result.current.filteredProducts).toHaveLength(4);
    expect(result.current.paginatedProducts).toHaveLength(4);
  });

  it("filters by search term", async () => {
    const { result } = renderHook(() => useShopFilters(products, "en"));
    act(() => {
      result.current.setSearchTerm("herbal");
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.debouncedSearch).toBe("herbal");
    expect(result.current.filteredProducts).toHaveLength(1);
    expect(result.current.filteredProducts[0]._id).toBe("p1");
  });

  it("filters by category", () => {
    const { result } = renderHook(() => useShopFilters(products, "en"));
    act(() => {
      result.current.setCategoryFilter("Supplements");
    });
    expect(result.current.filteredProducts).toHaveLength(2);
    expect(result.current.filteredProducts.map((p: any) => p._id).sort()).toEqual(["p3", "p4"]);
  });

  it("uses 'All' category by default", () => {
    const { result } = renderHook(() => useShopFilters(products, "en"));
    expect(result.current.categoryFilter).toBe("All");
  });

  it("sorts by price ascending", () => {
    const { result } = renderHook(() => useShopFilters(products, "en"));
    act(() => {
      result.current.setSortBy("price-low");
    });
    const prices = result.current.sortedProducts.map((p: any) => p.discountPrice);
    expect(prices).toEqual([45, 90, 180, 280]);
  });

  it("sorts by price descending", () => {
    const { result } = renderHook(() => useShopFilters(products, "en"));
    act(() => {
      result.current.setSortBy("price-high");
    });
    const prices = result.current.sortedProducts.map((p: any) => p.discountPrice);
    expect(prices).toEqual([280, 180, 90, 45]);
  });

  it("sorts by best-selling (total reviews)", () => {
    const prodWithReviews = [
      makeProduct("p1", "A", "Cat", 10, 9, 4),
      makeProduct("p2", "B", "Cat", 20, 18, 5),
    ];
    prodWithReviews[0].reviewStats.totalReviews = 10;
    prodWithReviews[1].reviewStats.totalReviews = 20;

    const { result } = renderHook(() => useShopFilters(prodWithReviews, "en"));
    act(() => {
      result.current.setSortBy("best-selling");
    });
    expect(result.current.sortedProducts[0]._id).toBe("p2");
    expect(result.current.sortedProducts[1]._id).toBe("p1");
  });

  it("paginates correctly", () => {
    const manyProducts = Array.from({ length: 25 }, (_, i) =>
      makeProduct(`p${i}`, `Product ${i}`, "Cat", 10, 10)
    );
    const { result } = renderHook(() => useShopFilters(manyProducts, "en"));
    expect(result.current.totalPages).toBe(3);
    expect(result.current.paginatedProducts).toHaveLength(12);
    expect(result.current.paginatedProducts[0]._id).toBe("p9");
  });

  it("goToPage navigates to valid pages", () => {
    const manyProducts = Array.from({ length: 25 }, (_, i) =>
      makeProduct(`p${i}`, `Product ${i}`, "Cat", 10, 10)
    );
    const { result } = renderHook(() => useShopFilters(manyProducts, "en"));
    act(() => {
      result.current.goToPage(2);
    });
    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedProducts[0]._id).toBe("p2");
  });

  it("goToPage clamps to valid range", () => {
    const { result } = renderHook(() => useShopFilters(products, "en"));
    act(() => {
      result.current.goToPage(-1);
    });
    expect(result.current.currentPage).toBe(1);
    act(() => {
      result.current.goToPage(999);
    });
    expect(result.current.currentPage).toBe(1);
  });

  it("resetFilters clears all filters", () => {
    const { result } = renderHook(() => useShopFilters(products, "en"));
    act(() => {
      result.current.setSearchTerm("herbal");
      result.current.setCategoryFilter("Oils");
      result.current.setSortBy("price-low");
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    act(() => {
      result.current.resetFilters();
    });
    expect(result.current.searchTerm).toBe("");
    expect(result.current.debouncedSearch).toBe("");
    expect(result.current.categoryFilter).toBe("All");
    expect(result.current.sortBy).toBe("newest");
    expect(result.current.currentPage).toBe(1);
  });

  it("debounced search delays filter application", () => {
    const { result } = renderHook(() => useShopFilters(products, "en"));
    act(() => {
      result.current.setSearchTerm("herbal");
    });
    expect(result.current.debouncedSearch).toBe("");
    expect(result.current.filteredProducts).toHaveLength(4);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.debouncedSearch).toBe("herbal");
    expect(result.current.filteredProducts).toHaveLength(1);
  });

  it("multi-language search works with translation objects", () => {
    const localizedProducts = [
      makeProduct("p1", { en: "Herbal Tea", ta: "மூலிகை தேநீர்" }, { en: "Beverages", ta: "பானங்கள்" }, 100, 90),
      makeProduct("p2", { en: "Ayurvedic Oil", ta: "ஆயுர்வேத எண்ணெய்" }, { en: "Oils", ta: "எண்ணெய்கள்" }, 200, 180),
    ];

    const { result } = renderHook(() => useShopFilters(localizedProducts, "ta"));
    act(() => {
      result.current.setSearchTerm("எண்ணெய்");
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.filteredProducts).toHaveLength(1);
    expect(result.current.filteredProducts[0]._id).toBe("p2");
  });

  it("multi-language category filter works with translation objects", () => {
    const localizedProducts = [
      makeProduct("p1", { en: "Herbal Tea", ta: "மூலிகை தேநீர்" }, { name: { en: "Beverages", ta: "பானங்கள்" } }, 100, 90),
      makeProduct("p2", { en: "Ayurvedic Oil", ta: "ஆயுர்வேத எண்ணெய்" }, { name: { en: "Oils", ta: "எண்ணெய்கள்" } }, 200, 180),
    ];

    const { result } = renderHook(() => useShopFilters(localizedProducts, "ta"));
    expect(result.current.categories).toContain("பானங்கள்");
    expect(result.current.categories).toContain("எண்ணெய்கள்");
    act(() => {
      result.current.setCategoryFilter("எண்ணெய்கள்");
    });
    expect(result.current.filteredProducts).toHaveLength(1);
    expect(result.current.filteredProducts[0]._id).toBe("p2");
  });

  it("empty results when nothing matches", () => {
    const { result } = renderHook(() => useShopFilters(products, "en"));
    act(() => {
      result.current.setSearchTerm("zzzznotfound");
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.filteredProducts).toHaveLength(0);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.paginatedProducts).toHaveLength(0);
  });

  it("searching by description works", () => {
    const prodWithDesc = [
      { ...products[0], description: "A refreshing organic beverage" },
      { ...products[1], description: "Pure essential oil" },
    ] as any[];

    const { result } = renderHook(() => useShopFilters(prodWithDesc, "en"));
    act(() => {
      result.current.setSearchTerm("organic");
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.filteredProducts).toHaveLength(1);
    expect(result.current.filteredProducts[0]._id).toBe("p1");
  });

  it("sorts by newest (default) via _id descending", () => {
    const diffProducts = [
      makeProduct("a001", "A Product", "Cat", 20, 18),
      makeProduct("z001", "Z Product", "Cat", 10, 10),
    ];
    const { result } = renderHook(() => useShopFilters(diffProducts, "en"));
    expect(result.current.sortedProducts[0]._id).toBe("z001");
    expect(result.current.sortedProducts[1]._id).toBe("a001");
  });

  it("search resets to page 1", () => {
    const manyProducts = Array.from({ length: 25 }, (_, i) =>
      makeProduct(`p${i}`, `Product ${i}`, "Cat", 10, 10)
    );
    const { result } = renderHook(() => useShopFilters(manyProducts, "en"));
    act(() => {
      result.current.goToPage(3);
    });
    expect(result.current.currentPage).toBe(3);

    act(() => {
      result.current.setSearchTerm("Product 0");
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.currentPage).toBe(1);
  });
});