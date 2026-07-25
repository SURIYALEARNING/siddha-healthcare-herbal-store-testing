import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { fetchProductsV2Api, type ProductsQueryParams } from "../api/productsV2";
import { fetchCategoriesApi } from "../api/categories";
import ProductCardV2 from "../components/product/ProductCardV2";
import type { ProductV2, CategoryV2 } from "../types/v2";

const SORT_OPTIONS = [
  { value: "newest", en: "Newest", ta: "புதியவை" },
  { value: "price-asc", en: "Price: Low to High", ta: "விலை: குறைந்த முதல் அதிக" },
  { value: "price-desc", en: "Price: High to Low", ta: "விலை: அதிக முதல் குறைந்த" },
  { value: "rating", en: "Top Rated", ta: "அதிக மதிப்பீடு" },
  { value: "best-selling", en: "Best Selling", ta: "அதிகம் விற்பனையானவை" },
];

export default function ProductsV2() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "en" | "ta";

  const [products, setProducts] = useState<ProductV2[]>([]);
  const [categories, setCategories] = useState<CategoryV2[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [mobileFilters, setMobileFilters] = useState(false);

  useEffect(() => {
    fetchCategoriesApi(true).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, maxPrice, sort]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: ProductsQueryParams = {
        page,
        limit: 12,
        sort,
        active: true,
        search: search || undefined,
        category: categoryFilter || undefined,
        maxPrice: maxPrice < 5000 ? maxPrice : undefined,
      };
      const res = await fetchProductsV2Api(params);
      setProducts(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, maxPrice, sort]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setMaxPrice(5000);
    setSort("newest");
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 border-b border-gray-100 pb-5">
        <h1 className="text-3xl font-bold font-display text-emerald-950 tracking-tight leading-none">
          {lang === "ta" ? "பாரம்பரிய மருந்துகள்" : "Traditional Remedies"}
        </h1>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mt-2">
          {lang === "ta"
            ? "ஆயுஷ் சான்றிதழ் பெற்ற கரிம சித்த மருந்துகள்"
            : "Certified organic Siddha medicines for natural wellness"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-100 space-y-6 sticky top-24">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {t("common.searchCatalog")}
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder={lang === "ta" ? "தேடுக..." : "Search remedies..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:outline-none focus:border-siddha-dark focus:bg-white text-gray-800 transition-colors"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {t("common.categories")}
            </h3>
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => setCategoryFilter("")}
                className={`px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors cursor-pointer ${
                  !categoryFilter
                    ? "bg-siddha-light text-siddha-dark"
                    : "text-gray-500 hover:bg-gray-50 hover:text-siddha-dark"
                }`}
              >
                {lang === "ta" ? "அனைத்தும்" : "All"}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setCategoryFilter(cat._id)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors cursor-pointer ${
                    categoryFilter === cat._id
                      ? "bg-siddha-light text-siddha-dark"
                      : "text-gray-500 hover:bg-gray-50 hover:text-siddha-dark"
                  }`}
                >
                  {cat.name[lang] || cat.name.en}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs text-gray-400 uppercase font-bold">
              <span>{lang === "ta" ? "அதிகபட்ச விலை" : "Max Price"}</span>
              <span className="text-siddha-dark font-black">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min={0}
              max={5000}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-siddha-dark bg-slate-100 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {t("common.sortBy")}
            </h3>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full p-2.5 border border-gray-150 rounded-xl text-xs bg-gray-50 text-gray-600 focus:outline-none focus:border-siddha-dark cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt[lang] || opt.en}
                </option>
              ))}
            </select>
          </div>

          {(search || categoryFilter || maxPrice < 5000) && (
            <button
              onClick={resetFilters}
              className="w-full py-2 text-xs font-bold text-siddha-dark bg-siddha-light rounded-xl hover:bg-[#cbfcd9] transition-colors cursor-pointer"
            >
              {t("common.resetFilters")}
            </button>
          )}
        </aside>

        <main className="lg:col-span-9 space-y-6">
          {/* Mobile Filter Bar */}
          <div className="lg:hidden flex flex-col gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={lang === "ta" ? "தேடுக..." : "Search remedies..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-white border border-gray-150 rounded-xl text-xs focus:outline-none focus:border-siddha-dark text-gray-800"
              />
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setMobileFilters(!mobileFilters)}
                className="flex items-center justify-center space-x-1 px-4 py-3 bg-white border border-gray-150 rounded-xl text-xs font-medium text-gray-600 active:bg-gray-50 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{t("common.filters")}</span>
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="flex-1 p-3 border border-gray-150 bg-white rounded-xl text-xs text-gray-600 focus:outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt[lang] || opt.en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {mobileFilters && (
            <div className="lg:hidden p-5 bg-white border border-emerald-100 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {t("common.filterAndRefine")}
                </h3>
                <button onClick={() => setMobileFilters(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  {t("common.categories")}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setCategoryFilter("")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full cursor-pointer transition-colors border ${
                      !categoryFilter
                        ? "bg-siddha-dark text-white border-siddha-dark"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                  >
                    {lang === "ta" ? "அனைத்தும்" : "All"}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => setCategoryFilter(cat._id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full cursor-pointer transition-colors border ${
                        categoryFilter === cat._id
                          ? "bg-siddha-dark text-white border-siddha-dark"
                          : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {cat.name[lang] || cat.name.en}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs text-gray-400 uppercase font-bold mb-1">
                  <span>{lang === "ta" ? "அதிகபட்ச விலை" : "Max Price"}</span>
                  <span className="text-siddha-dark font-black">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5000}
                  step={50}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-siddha-dark bg-slate-100 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <button
                onClick={() => { resetFilters(); setMobileFilters(false); }}
                className="w-full py-2 bg-siddha-dark text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                {t("common.resetFilters")}
              </button>
            </div>
          )}

          {/* Results Count */}
          <div className="flex justify-between items-center px-2">
            <p className="text-xs text-gray-400 font-semibold">
              {lang === "ta"
                ? `${total} முடிவுகள்`
                : `Showing ${total} results`}
            </p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-siddha-dark border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-400 mt-3">{t("common.loading")}</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCardV2 key={p._id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 pt-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {t("common.prev")}
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                    .map((p, idx, arr) => (
                      <span key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="px-1 text-gray-400 text-xs">...</span>
                        )}
                        <button
                          onClick={() => setPage(p)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                            p === page
                              ? "bg-siddha-dark text-white border-siddha-dark"
                              : "border-gray-200 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      </span>
                    ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {t("common.next")}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8 space-y-4">
              <SlidersHorizontal className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-lg font-bold text-emerald-950">
                {lang === "ta" ? "முடிவுகள் எதுவும் இல்லை" : "No results found"}
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                {lang === "ta"
                  ? "உங்கள் தேடலுக்கு பொருந்தும் மருந்துகள் எதுவும் இல்லை. வடிப்பான்களை மீட்டமைத்து மீண்டும் முயற்சிக்கவும்."
                  : "No remedies match your search. Try resetting filters or search with different keywords."}
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-siddha-dark text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {t("common.resetFilters")}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
