import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Save, Image, Users } from "lucide-react";
import { useToastContext } from "../../context/ToastContext";
import {
  fetchCarouselProductsApi,
  fetchSocialProductsApi,
  adminUpdateCarouselProductsApi,
  adminUpdateSocialProductsApi,
} from "../../api/carousel";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import type { Product, SocialPlatform } from "../../types";

function getTransValue(val: any, lang: string): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[lang] || val.en || "";
}

const SOCIAL_OPTIONS: SocialPlatform[] = ["instagram", "youtube", "facebook", "tiktok"];

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

  const [socialSelectedIds, setSocialSelectedIds] = useState<Set<string>>(new Set());
  const [socialForm, setSocialForm] = useState<Record<string, { social: SocialPlatform; url: string }>>({});
  const [socialSaving, setSocialSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const carouselProducts = await fetchCarouselProductsApi();
      setSelectedIds(new Set(carouselProducts.map((p) => p._id)));
      const socialProducts = await fetchSocialProductsApi();
      const ids = new Set<string>();
      const form: Record<string, { social: SocialPlatform; url: string }> = {};
      socialProducts.forEach((sp) => {
        const pid = sp.product._id;
        ids.add(pid);
        form[pid] = { social: sp.social, url: sp.url };
      });
      setSocialSelectedIds(ids);
      setSocialForm(form);
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

  const toggleSocial = (id: string) => {
    setSocialSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setSocialForm((form) => {
          const copy = { ...form };
          delete copy[id];
          return copy;
        });
      } else {
        next.add(id);
        setSocialForm((form) => ({
          ...form,
          [id]: form[id] || { social: "instagram", url: "" },
        }));
      }
      return next;
    });
  };

  const selectAllSocial = () => {
    setSocialSelectedIds(new Set(products.map((p) => p._id)));
    setSocialForm((form) => {
      const copy = { ...form };
      products.forEach((p) => {
        if (!copy[p._id]) copy[p._id] = { social: "instagram", url: "" };
      });
      return copy;
    });
  };

  const clearAllSocial = () => {
    setSocialSelectedIds(new Set());
    setSocialForm({});
  };

  const setSocial = (id: string, patch: { social?: SocialPlatform; url?: string }) => {
    setSocialForm((form) => ({
      ...form,
      [id]: { ...(form[id] || { social: "instagram", url: "" }), ...patch },
    }));
  };

  const handleSaveSocial = async () => {
    const ids = Array.from(socialSelectedIds);
    if (ids.length < 6) {
      showError(t("messages.errorMessage"), "Select at least 6 products for the Social Product Marquee.");
      return;
    }
    for (const id of ids) {
      const conf = socialForm[id];
      if (!conf || !conf.url.trim() || !conf.url.trim().startsWith("http")) {
        showError(t("messages.errorMessage"), "Every selected product needs a valid social link (starting with http).");
        return;
      }
    }
    setSocialSaving(true);
    try {
      const items = products
        .filter((p) => socialSelectedIds.has(p._id))
        .map((p) => ({
          productId: p._id,
          social: socialForm[p._id].social,
          url: socialForm[p._id].url.trim(),
        }));
      await adminUpdateSocialProductsApi(items);
      showSuccess(t("messages.successMessage"), "Social Product Marquee updated successfully.");
    } catch (err: any) {
      showError(t("messages.errorMessage"), err?.response?.data?.error || "Failed to update Social Product Marquee.");
    } finally {
      setSocialSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const renderProductCard = (p: Product, checked: boolean, onToggle: () => void) => {
    const img = p.media?.[0]?.url || p.images?.[0] || "";
    return (
      <button
        key={p._id}
        onClick={onToggle}
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
  };

  return (
    <div className="space-y-8">
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
          {products.map((p) => renderProductCard(p, selectedIds.has(p._id), () => toggle(p._id)))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No products available. Create products first.
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold font-display text-emerald-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-siddha-dark" />
              Social Product Marquee
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Select at least 6 products and set a social media link for each. They appear in the
              scrolling marquee on the About page. Selected: <strong>{socialSelectedIds.size}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={selectAllSocial} variant="secondary" size="sm">
              Select All
            </Button>
            <Button onClick={clearAllSocial} variant="secondary" size="sm">
              Clear All
            </Button>
            <Button onClick={handleSaveSocial} variant="primary" size="sm" disabled={socialSaving}>
              <Save className="w-4 h-4 mr-1 inline" />
              {socialSaving ? "Saving..." : "Save Marquee"}
            </Button>
          </div>
        </div>

        {socialSelectedIds.size > 0 && socialSelectedIds.size < 6 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium px-4 py-2 rounded-xl">
            Please select at least 6 products. Currently selected: {socialSelectedIds.size}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[480px] overflow-y-auto p-1">
          {products.map((p) => renderProductCard(p, socialSelectedIds.has(p._id), () => toggleSocial(p._id)))}
        </div>

        {socialSelectedIds.size > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-700">
              Social links for selected products
            </h3>
            <div className="space-y-2">
              {products
                .filter((p) => socialSelectedIds.has(p._id))
                .map((p) => {
                  const conf = socialForm[p._id] || { social: "instagram", url: "" };
                  const img = p.media?.[0]?.url || p.images?.[0] || "";
                  return (
                    <div
                      key={p._id}
                      className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                        {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : null}
                      </div>
                      <p className="text-xs font-semibold text-gray-800 flex-1 min-w-32">
                        {getTransValue(p.name, lang)}
                      </p>
                      <select
                        value={conf.social}
                        onChange={(e) => setSocial(p._id, { social: e.target.value as SocialPlatform })}
                        className="px-2 py-1.5 border border-gray-200 bg-white rounded-lg text-xs font-medium focus:outline-none focus:border-siddha-dark cursor-pointer"
                      >
                        {SOCIAL_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                      <input
                        type="url"
                        value={conf.url}
                        onChange={(e) => setSocial(p._id, { url: e.target.value })}
                        placeholder="https://instagram.com/..."
                        className="flex-1 min-w-48 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-siddha-dark font-mono"
                      />
                      <Button onClick={() => toggleSocial(p._id)} variant="ghost" size="sm">
                        Remove
                      </Button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {products.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No products available. Create products first.
          </div>
        )}
      </div>
    </div>
  );
}