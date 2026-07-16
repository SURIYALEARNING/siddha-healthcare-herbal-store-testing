import { useState } from "react";
import { Info, Sparkles } from "lucide-react";

interface ProductTabsProps {
  ingredients: string[];
  benefits: string[];
  usageInstructions: string[];
}

type Tab = "ingredients" | "benefits" | "usage";

const TABS: { id: Tab; label: string }[] = [
  { id: "ingredients", label: "ingredients" },
  { id: "benefits", label: "benefits" },
  { id: "usage", label: "How to Use" },
];

export default function ProductTabs({ ingredients, benefits, usageInstructions }: ProductTabsProps) {
  const [active, setActive] = useState<Tab>("benefits");

  return (
    <section className="mt-12 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 space-y-6">
      <div className="flex space-x-1.5 border-b border-gray-100 pb-2 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shrink-0 ${
              active === tab.id
                ? "bg-siddha-dark text-white"
                : "text-gray-400 hover:text-gray-700 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pt-2">
        {active === "ingredients" && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
              <Info className="w-4 h-4 text-siddha-dark mr-1.5" />
              Raw Organic Sourcing list:
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
              <Sparkles className="w-4 h-4 text-siddha-gold animate-bounce mr-1.5" />
              Therapeutic Health Advantages:
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
              Direction Rules & Dosage Levels:
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
      </div>
    </section>
  );
}
