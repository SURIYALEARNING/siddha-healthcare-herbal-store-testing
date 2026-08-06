import { useTranslation } from 'react-i18next';
import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useShopFilters } from "../hooks/useShopFilters";
import { ShopProductCard, ShopDesktopFilters, ShopMobileFilters } from "../components/shop";
import { fetchCategoriesApi } from "../api/categories";
import type { Category } from "../types";

export default function Shop() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  
  const { products, addToCart, toggleWishlist, isInWishlist } = useApp();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategoriesApi(true).then(setDbCategories).catch(() => {});
  }, []);

  const {
    searchTerm, setSearchTerm,
    categoryFilter, setCategoryFilter,
    sortBy, setSortBy,
    categories,
    paginatedProducts, sortedProducts,
    currentPage, totalPages, goToPage,
    resetFilters,
  } = useShopFilters(products, lang, dbCategories);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <div className="mb-8 border-b border-gray-100 pb-5">
        <h1 className="text-3xl font-bold font-display text-emerald-950 tracking-tight leading-none">
          {t('shop.title')}
        </h1>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mt-2">
          {t('shop.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        <ShopDesktopFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categoryFilter={categoryFilter}
          categories={categories}
          onCategoryChange={setCategoryFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <main className="lg:col-span-9 space-y-6">

          <div className="lg:hidden flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t('common.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-white border border-gray-150 rounded-xl text-xs focus:outline-none focus:border-siddha-dark text-gray-800"
              />
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-4 py-3 bg-white border border-gray-150 rounded-xl text-xs font-medium text-gray-600 active:bg-gray-50 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{t('Sort')}{categoryFilter !== "All" ? ` (${categoryFilter})` : ""}</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-none p-3 border border-gray-150 bg-white rounded-xl text-xs text-gray-600 focus:outline-none cursor-pointer"
              >
                <option value="newest">{t('common.newestItem')}</option>
                <option value="best-selling">{t('common.bestSellers')}</option>
                <option value="price-low">{t('common.priceLow')}</option>
                <option value="price-high">{t('common.priceHigh')}</option>
              </select>
            </div>
          </div>

          {mobileFiltersOpen && (
            <ShopMobileFilters
              categoryFilter={categoryFilter}
              categories={categories}
              onCategoryChange={setCategoryFilter}
              onClose={() => setMobileFiltersOpen(false)}
            />
          )}

          <div className="flex justify-between items-center px-2">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              {categoryFilter !== "All"
                ? t('shop.displayingResults', { count: sortedProducts.length, category: categoryFilter })
                : t('shop.displayingResults', { count: sortedProducts.length })}
            </p>
          </div>

          {paginatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map((p) => (
                  <ShopProductCard
                    key={p._id}
                    product={p}
                    isInWishlist={isInWishlist(p._id)}
                    onToggleWishlist={toggleWishlist}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8 space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-gray-400 mx-auto">
                <SlidersHorizontal className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-emerald-950">{t('shop.noResultsTitle')}</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                {t('shop.noResultsMessage')}
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-siddha-dark text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {t('shop.resetFilters')}
              </button>
            </div>
          )}

        </main>

      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const { t } = useTranslation();
  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex justify-center items-center space-x-2 pt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      >
        {t('common.prev')}
      </button>
      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer">1</button>
          {start > 2 && <span className="px-1 text-gray-400 text-xs">...</span>}
        </>
      )}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
            page === currentPage
              ? "bg-siddha-dark text-white border-siddha-dark"
              : "border-gray-200 text-gray-500 hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-gray-400 text-xs">...</span>}
          <button onClick={() => onPageChange(totalPages)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer">{totalPages}</button>
        </>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      >
        {t('common.next')}
      </button>
    </div>
  );
}
