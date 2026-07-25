import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";
import type { Product } from "../../types";

interface AccountWishlistProps {
  products: Product[];
}

function getVal(val: any, lang: string): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[lang] || val.en || "";
}

function getCatName(cat: any, lang: string): string {
  if (!cat) return "";
  if (typeof cat === "string") return cat;
  return getVal((cat as any).name, lang) || (cat as any)._id || "";
}

export default function AccountWishlist({ products }: AccountWishlistProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-gray-850 uppercase tracking-wider border-b border-gray-50 pb-2.5">{t("user.myWishlist")}</h3>
        <div className="text-center py-16 bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-3">
          <div className="w-12 h-12 bg-gray-105 rounded-full flex items-center justify-center mx-auto text-gray-405">
            <Heart className="w-6 h-6 text-gray-400" />
          </div>
          <h4 className="font-bold text-emerald-950">{t("user.noWishlist")}</h4>
          <p className="text-xs text-gray-450 max-w-sm mx-auto">{t("user.noWishlist")}</p>
          <Link to="/shop" className="inline-block px-4 py-2 bg-siddha-dark text-white rounded-xl text-xs font-bold">{t("navigation.products")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-gray-850 uppercase tracking-wider border-b border-gray-50 pb-2.5">{t("user.myWishlist")}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map((p) => {
          const pName = getVal(p.name, lang);
          const catName = getCatName(p.category, lang);
          return (
            <div key={p._id} className="border border-gray-150 rounded-2xl p-4 flex items-center space-x-3 hover:border-emerald-150 transition-all">
              <img src={p.media?.[0]?.url || p.images[0]} alt={pName} className="w-16 h-16 object-cover rounded-xl bg-slate-50" />
              <div className="flex-1 min-w-0 space-y-1">
                <Link to={`/products/${p._id}`} className="hover:text-siddha-dark transition-colors">
                  <h4 className="text-xs font-bold text-emerald-950 truncate leading-none mb-1">{pName}</h4>
                </Link>
                <p className="text-[10px] text-gray-400 font-semibold leading-none uppercase">{catName}</p>
                <div className="pt-1 select-none">
                  <span className="text-xs font-black text-siddha-dark">₹{p.discountPrice}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Link to={`/products/${p._id}`} className="px-2.5 py-1 bg-siddha-light hover:bg-[#cbfcd9] text-siddha-dark text-[10px] font-bold rounded">
                  {t("common.viewAll")}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
