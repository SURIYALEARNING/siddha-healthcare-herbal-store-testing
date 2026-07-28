import { useTranslation } from 'react-i18next';

interface ShopMobileFiltersProps {
  categoryFilter: string;
  categories: string[];
  onCategoryChange: (cat: string) => void;
  onClose: () => void;
}

export function ShopMobileFilters({
  categoryFilter,
  categories,
  onCategoryChange,
  onClose,
}: ShopMobileFiltersProps) {
  const { t } = useTranslation();
  return (
    <div className="lg:hidden p-5 bg-white border border-emerald-100 rounded-2xl space-y-4 animate-fadeIn">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('common.filterAndRefine')}</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t('common.therapeuticCategories')}</label>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => {
                  onCategoryChange(c);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-full cursor-pointer transition-colors border ${categoryFilter === c
                    ? "bg-siddha-dark text-white border-siddha-dark"
                    : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

      </div>
      <button
        onClick={onClose}
        className="w-full py-2 bg-siddha-dark text-white text-xs font-bold rounded-xl"
      >
        {t('common.applyCriteria')}
      </button>
    </div>
  );
}
