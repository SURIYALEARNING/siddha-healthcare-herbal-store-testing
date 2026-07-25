import { memo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Star, Heart, ShoppingBag } from "lucide-react";
import { Product } from "../../types";

interface ShopProductCardProps {
  product: Product;
  isInWishlist: boolean;
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ShopProductCard = memo(function ShopProductCard({
  product: p,
  isInWishlist: inFav,
  onToggleWishlist,
  onAddToCart,
}: ShopProductCardProps) {
  const { t } = useTranslation();
  const hasDiscount = p.discountPrice < p.price;
  const [reviewIndex, setReviewIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reviews = p.latestReviews?.filter((r) => r.comment?.trim()) || [];

  useEffect(() => {
    if (reviews.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [reviews.length]);

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-emerald-150 transition-all flex flex-col hover:shadow-md relative group p-4">
      <div className="absolute top-6 left-6 flex flex-col space-y-1 z-10">
        {hasDiscount && (
          <span className="bg-[#a49870] text-siddha-dark text-[9px] font-black uppercase px-2 py-0.5 rounded">
            {t('product.offer')}
          </span>
        )}
        {p.stock <= 0 ? (
          <span className="bg-rose-100 text-rose-800 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
            {t('product.soldOut')}
          </span>
        ) : p.stock < 10 ? (
          <span className="bg-amber-100 text-amber-800 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
            {t('product.shortStock')}
          </span>
        ) : null}
      </div>

      <button
        onClick={() => onToggleWishlist(p._id)}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/80 hover:bg-white text-rose-600 hover:text-rose-700 transition-colors shadow-xs z-10 cursor-pointer"
      >
        <Heart className={`w-4 h-4 ${inFav ? "fill-rose-600 text-rose-600" : ""}`} />
      </button>

      <div className="w-full h-44 rounded-xl bg-slate-50 overflow-hidden mb-4">
        <img
          src={p.images[0]}
          alt={p.name}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </div>

      <div className="flex items-center text-xs text-amber-500 space-x-1.5 mb-1.5 font-bold">
        <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
        <span className="text-gray-700">{p.reviewStats?.averageRating || 0}</span>
        <span className="text-gray-400 font-semibold">({p.reviewStats?.totalReviews || 0})</span>
      </div>

      <Link to={`/products/${p._id}`} className="group-hover:text-siddha-dark transition-colors">
        <h3 className="font-bold text-emerald-950 text-sm tracking-tight leading-snug lines-clamp-2 min-h-10">
          {p.name}
        </h3>
      </Link>
      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">
        {p.category}
      </p>

      {reviews.length > 0 && (
        <div className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50/40 shadow-sm px-3 py-2 min-h-[4rem]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">{t('product.review')}</span>
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 ${
                    i < reviews[reviewIndex].rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
          <p key={reviewIndex} className="text-[11px] font-semibold text-emerald-800 leading-snug animate-fadeIn line-clamp-2">
            &ldquo;{reviews[reviewIndex].comment}&rdquo;
          </p>
        </div>
      )}

      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
        <div className="flex items-baseline space-x-1.5">
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">₹{p.price}</span>
          )}
          <span className="text-base font-black text-siddha-dark">₹{p.discountPrice}</span>
        </div>

        {p.stock > 0 ? (
          <button
            onClick={() => onAddToCart(p, 1)}
            className="px-3.5 py-1.5 bg-siddha-light hover:bg-[#cbfcd9] text-siddha-dark rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t('product.addToBag')}</span>
          </button>
        ) : (
          <span className="text-xs font-bold text-gray-400">{t('product.outOfStock')}</span>
        )}
      </div>
    </div>
  );
});
