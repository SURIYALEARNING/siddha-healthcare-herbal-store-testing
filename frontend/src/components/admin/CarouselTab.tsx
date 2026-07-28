import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Save, Image } from "lucide-react";
import { useToastContext } from "../../context/ToastContext";
import { fetchCarouselProductsApi, adminUpdateCarouselProductsApi } from "../../api/carousel";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import type { Product } from "../../types";

function getTransValue(val: any, lang: string): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[lang] || val.en || "";
}

interface CarouselTabProps {
  products: Product[];
}

export default function CarouselTab({ products }: CarouselTabProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { showSuccess, showError } = useToastContext();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const carouselProducts = await fetchCarouselProductsApi();
      setSelectedIds(new Set(carouselProducts.map((p) => p._id)));
      setLoading(false);
    };
    load();
  }, []);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(products.map((p) => p._id)));
  };

  const clearAll = () => {
    setSelectedIds(new Set());
  };

  const handleSave = async () => {
    if (selectedIds.size < 6) {
      showError(t("messages.errorMessage"), "Select at least 6 products for the carousel.");
      return;
    }
    setSaving(true);
    try {
      await adminUpdateCarouselProductsApi(Array.from(selectedIds));
      showSuccess(t("messages.successMessage"), "Carousel products updated successfully.");
    } catch {
      showError(t("messages.errorMessage"), "Failed to update carousel.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-display text-emerald-900">
            Promotional Carousel
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Select products to display in the home page carousel (minimum 6).
            Selected: <strong>{selectedIds.size}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={selectAll} variant="secondary" size="sm">
            Select All
          </Button>
          <Button onClick={clearAll} variant="secondary" size="sm">
            Clear All
          </Button>
          <Button onClick={handleSave} variant="primary" size="sm" disabled={saving}>
            <Save className="w-4 h-4 mr-1 inline" />
            {saving ? "Saving..." : "Save Carousel"}
          </Button>
        </div>
      </div>

      {selectedIds.size > 0 && selectedIds.size < 6 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium px-4 py-2 rounded-xl">
          Please select at least 6 products. Currently selected: {selectedIds.size}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[600px] overflow-y-auto p-1">
        {products.map((p) => {
          const checked = selectedIds.has(p._id);
          const img = p.media?.[0]?.url || p.images?.[0] || "";

          return (
            <button
              key={p._id}
              onClick={() => toggle(p._id)}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                checked
                  ? "border-siddha-dark bg-siddha-dark/5 shadow-sm"
                  : "border-gray-100 hover:border-gray-200 bg-gray-50/50"
              }`}
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-100">
                {img ? (
                  <img src={img} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Image className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="w-full min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {getTransValue(p.name, lang)}
                </p>
                <p className="text-[10px] font-mono text-gray-500">
                  ₹{p.discountPrice}
                </p>
              </div>
              {checked && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-siddha-dark rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">
          No products available. Create products first.
        </div>
      )}
    </div>
  );
}
