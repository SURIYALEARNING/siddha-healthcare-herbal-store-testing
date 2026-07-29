import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Product, Category } from "../types";

const ITEMS_PER_PAGE = 12;
const DEBOUNCE_MS = 300;

function getCategoryName(p: Product, lang: string): string {
  const cat = p.category;
  if (!cat) return "";
  if (typeof cat === "string") return cat;
  const name = (cat as any).name;
  if (!name) return (cat as any)._id || "";
  if (typeof name === "string") return name;
  return name[lang] || name.en || "";
}

function getVal(val: any, lang: string): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[lang] || val.en || "";
}

export function useShopFilters(products: Product[], lang: string = "en", dbCategories?: Category[]) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
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
    if (dbCategories && dbCategories.length > 0) {
      const names = new Set<string>();
      dbCategories.forEach((c) => {
        const n = c.name?.[lang] || c.name?.en;
        if (n) names.add(n);
      });
      return ["All", ...Array.from(names).sort()];
    }
    const catSet = new Set(products.map((p) => getCategoryName(p, lang)));
    return ["All", ...Array.from(catSet).filter(Boolean).sort()];
  }, [products, lang, dbCategories]);

  const catIdToName = useMemo(() => {
    const map: Record<string, string> = {};
    if (dbCategories) {
      dbCategories.forEach((c) => {
        const n = c.name?.[lang] || c.name?.en;
        if (c._id && n) map[c._id] = n;
      });
    }
    return map;
  }, [dbCategories, lang]);

  const getCatName = useCallback((p: Product): string => {
    const raw = getCategoryName(p, lang);
    if (catIdToName[raw]) return catIdToName[raw];
    return raw;
  }, [lang, catIdToName]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const term = debouncedSearch.toLowerCase();
      const pName = getVal(p.name, lang).toLowerCase();
      const pDesc = getVal(p.description, lang).toLowerCase();
      const matchesSearch =
        !term ||
        pName.includes(term) ||
        pDesc.includes(term);
      const catName = getCatName(p);
      const matchesCategory = categoryFilter === "All" || catName === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, debouncedSearch, categoryFilter, lang, getCatName]);

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
    setSortBy("newest");
    setCurrentPage(1);
    setSearchParams({});
  }, [setSearchParams]);

  const setCategory = useCallback((cat: string) => {
    setCategoryFilter(cat);
    setCurrentPage(1);
    setSearchParams({});
  }, [setSearchParams]);

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
    sortBy,
    setSortBy: setSort,
    categories,
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
