interface ShopMobileFiltersProps {
  categoryFilter: string;
  categories: string[];
  onCategoryChange: (cat: string) => void;
  maxPrice: number;
  priceRange: { min: number; max: number };
  onPriceChange: (price: number) => void;
  onClose: () => void;
}

export function ShopMobileFilters({
  categoryFilter,
  categories,
  onCategoryChange,
  maxPrice,
  priceRange,
  onPriceChange,
  onClose,
}: ShopMobileFiltersProps) {
  return (
    <div className="lg:hidden p-5 bg-white border border-emerald-100 rounded-2xl space-y-4 animate-fadeIn">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filter & Refine Remedials</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Therapeutic Categories</label>
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

        <div>
          <div className="flex justify-between items-center text-xs text-gray-400 uppercase font-bold mb-1">
            <span>Upper Price Limit:</span>
            <span className="text-siddha-dark font-black">{maxPrice === Infinity ? `Max` : `₹${maxPrice}`}</span>
          </div>
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            step="10"
            value={maxPrice}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            className="w-full accent-siddha-dark bg-slate-100 h-1.5 rounded-lg cursor-pointer"
          />
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-full py-2 bg-siddha-dark text-white text-xs font-bold rounded-xl"
      >
        Apply Criteria
      </button>
    </div>
  );
}
