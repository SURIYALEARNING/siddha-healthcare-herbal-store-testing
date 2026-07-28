import { useTranslation } from 'react-i18next';
import { Search } from "lucide-react";

interface ShopDesktopFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  categories: string[];
  onCategoryChange: (cat: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function ShopDesktopFilters({
  searchTerm,
  onSearchChange,
  categoryFilter,
  categories,
  onCategoryChange,
  sortBy,
  onSortChange,
}: ShopDesktopFiltersProps) {
  const { t } = useTranslation();
  return (
    <aside className="hidden lg:block lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-100 space-y-6 sticky top-24">
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('common.searchCatalog')}</h3>
        <div className="relative">
          <input
            type="text"
            placeholder={t('common.searchExPlaceholder')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:outline-none focus:border-siddha-dark focus:bg-white text-gray-800 transition-colors"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('common.categories')}</h3>
        <div className="flex flex-col space-y-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => onCategoryChange(c)}
              className={`px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors flex items-center justify-between cursor-pointer ${categoryFilter === c
                  ? "bg-siddha-light text-siddha-dark"
                  : "text-gray-500 hover:bg-gray-50 hover:text-siddha-dark"
                }`}
            >
              <span>{c}</span>
              {categoryFilter === c && <span className="text-[10px] font-bold">&#10003;</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('common.orderSorter')}</h3>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full p-2.5 border border-gray-150 rounded-xl text-xs bg-gray-50 text-gray-600 focus:outline-none focus:border-siddha-dark cursor-pointer"
        >
          <option value="newest">{t('common.newestLaunch')}</option>
          <option value="best-selling">{t('common.topPopularity')}</option>
          <option value="price-low">{t('common.priceLowToHigh')}</option>
          <option value="price-high">{t('common.priceHighToLow')}</option>
        </select>
      </div>
    </aside>
  );
}
