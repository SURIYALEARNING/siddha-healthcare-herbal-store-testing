import { useTranslation } from 'react-i18next';
import { useState } from "react";
import { Info, Sparkles, ShieldCheck, Archive, Tag } from "lucide-react";

interface ProductTabsProps {
  ingredients: string[];
  benefits: string[];
  usageInstructions: string[];
  safetyInstructions: string[];
  storageInstructions: string[];
  tags: string[];
}

type Tab = "ingredients" | "benefits" | "usage" | "safety" | "storage" | "tags";

export default function ProductTabs({ ingredients, benefits, usageInstructions, safetyInstructions, storageInstructions, tags }: ProductTabsProps) {
  const { t } = useTranslation();
  const [active, setActive] = useState<Tab>("benefits");

  const label = (key: string, fallback: string) => {
    const v = t(key);
    return v !== key ? v : fallback;
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "ingredients", label: t('product.ingredients'), icon: <Info className="w-3.5 h-3.5" /> },
    { id: "benefits", label: t('product.benefits'), icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: "usage", label: t('product.usageInstructions'), icon: <Info className="w-3.5 h-3.5" /> },
    { id: "safety", label: label('product.safetyInstructions', 'Safety Instructions'), icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: "storage", label: label('product.storageInstructions', 'Storage Instructions'), icon: <Archive className="w-3.5 h-3.5" /> },
    { id: "tags", label: label('product.tags', 'Tags'), icon: <Tag className="w-3.5 h-3.5" /> },
  ];

  const visibleTabs = TABS.filter((tab) => {
    if (tab.id === "ingredients") return ingredients && ingredients.length > 0;
    if (tab.id === "benefits") return benefits && benefits.length > 0;
    if (tab.id === "usage") return usageInstructions && usageInstructions.length > 0;
    if (tab.id === "safety") return safetyInstructions && safetyInstructions.length > 0;
    if (tab.id === "storage") return storageInstructions && storageInstructions.length > 0;
    if (tab.id === "tags") return tags && tags.length > 0;
    return true;
  });

  if (visibleTabs.length === 0) return null;

  return (
    <section className="mt-12 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 space-y-6">
      <div className="flex space-x-1.5 border-b border-gray-100 pb-2 overflow-x-auto">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shrink-0 ${
              active === tab.id
                ? "bg-siddha-dark text-white"
                : "text-gray-400 hover:text-gray-700 hover:bg-slate-50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pt-2">
        {active === "ingredients" && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
              <Info className="w-4 h-4 text-siddha-dark mr-1.5" />
              {t('raw Organic Sourcing')}
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ingredients?.map((ing, idx) => (
                <li key={idx} className="flex items-center space-x-2 text-xs text-gray-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-siddha-gold"></span>
                  <span className="font-semibold">{ing}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {active === "benefits" && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
              <Sparkles className="w-4 h-4 text-siddha-gold mr-1.5" />
              {t('therapeutic Health Advantages')}
            </p>
            <ul className="space-y-2">
              {benefits?.map((ben, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-siddha-dark shrink-0 mt-1.5"></span>
                  <span>{ben}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {active === "usage" && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
              <Info className="w-4 h-4 text-siddha-dark mr-1.5" />
              {t('direction Rules')}
            </p>
            <ol className="space-y-3">
              {usageInstructions?.map((ins, idx) => (
                <li key={idx} className="flex space-x-3 text-xs text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-siddha-light text-siddha-dark flex items-center justify-center font-bold text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{ins}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {active === "safety" && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
              <ShieldCheck className="w-4 h-4 text-siddha-dark mr-1.5" />
              {t('product.safetyPrecautions', 'Safety Precautions')}
            </p>
            <ul className="space-y-2">
              {safetyInstructions?.map((s, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {active === "storage" && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
              <Archive className="w-4 h-4 text-siddha-dark mr-1.5" />
              {t('product.storageGuidelines', 'Storage Guidelines')}
            </p>
            <ul className="space-y-2">
              {storageInstructions?.map((s, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-siddha-dark shrink-0 mt-1.5"></span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {active === "tags" && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
              <Tag className="w-4 h-4 text-siddha-dark mr-1.5" />
              {t('product.relatedTags', 'Related Tags')}
            </p>
            <div className="flex flex-wrap gap-2">
              {tags?.map((tag, idx) => (
                <span key={idx} className="px-3 py-1.5 text-xs font-semibold text-siddha-dark bg-siddha-light rounded-full border border-siddha-dark/10">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
