import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Product } from "../types";

const ITEMS_PER_PAGE = 12;
const DEBOUNCE_MS = 300;

export function useShopFilters(products: Product[]) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [maxPrice, setMaxPrice] = useState(500);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setCategoryFilter(cat);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return ["All", ...cats.sort()];
  }, [products]);

  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 100, max: 1000 };
    const prices = products.map((p) => p.discountPrice);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const term = debouncedSearch.toLowerCase();
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term);
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
      const matchesPrice = p.discountPrice <= maxPrice;
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, debouncedSearch, categoryFilter, maxPrice]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.discountPrice - b.discountPrice);
        break;
      case "price-high":
        sorted.sort((a, b) => b.discountPrice - a.discountPrice);
        break;
      case "best-selling":
        sorted.sort((a, b) => (b.reviewStats?.totalReviews || 0) - (a.reviewStats?.totalReviews || 0));
        break;
      default:
        sorted.sort((a, b) => b._id.localeCompare(a._id));
    }
    return sorted;
  }, [filteredProducts, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedProducts, safePage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearch("");
    setCategoryFilter("All");
    setMaxPrice(priceRange.max);
    setSortBy("newest");
    setCurrentPage(1);
    setSearchParams({});
  }, [priceRange.max, setSearchParams]);

  const setCategory = useCallback((cat: string) => {
    setCategoryFilter(cat);
    setCurrentPage(1);
    setSearchParams({});
  }, [setSearchParams]);

  const setPrice = useCallback((price: number) => {
    setMaxPrice(price);
    setCurrentPage(1);
  }, []);

  const setSort = useCallback((sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    categoryFilter,
    setCategoryFilter: setCategory,
    maxPrice,
    setMaxPrice: setPrice,
    sortBy,
    setSortBy: setSort,
    categories,
    priceRange,
    filteredProducts,
    sortedProducts,
    paginatedProducts,
    currentPage: safePage,
    totalPages,
    goToPage,
    setCurrentPage: goToPage,
    resetFilters,
  };
}
