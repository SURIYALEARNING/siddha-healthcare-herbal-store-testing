import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Star } from 'lucide-react';
import type { ProductV2 } from '../../types/v2';

interface ProductCardV2Props {
  product: ProductV2;
  onAddToCart?: (product: ProductV2) => void;
}

export default function ProductCardV2({ product, onAddToCart }: ProductCardV2Props) {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'ta';
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-emerald-150 transition-all flex flex-col hover:shadow-md group p-4">
      <div className="absolute top-6 left-6 flex flex-col space-y-1 z-10">
        {hasDiscount && (
          <span className="bg-[#a49870] text-siddha-dark text-[9px] font-black uppercase px-2 py-0.5 rounded">
            {lang === 'ta' ? 'சலுகை' : 'Offer'}
          </span>
        )}
      </div>

      <Link to={`/products-v2/${product.slug.en}`}>
        <div className="w-full h-44 rounded-xl bg-slate-50 overflow-hidden mb-4">
          <img
            src={product.images?.[0] || '/placeholder.png'}
            alt={product.name[lang]}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      </Link>

      <Link to={`/products-v2/${product.slug.en}`} className="group-hover:text-siddha-dark transition-colors">
        <h3 className="font-bold text-emerald-950 text-sm tracking-tight leading-snug min-h-10">
          {product.name[lang]}
        </h3>
      </Link>

      {product.shortDescription?.[lang] && (
        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
          {product.shortDescription[lang]}
        </p>
      )}

      <div className="flex items-center mt-2 text-xs text-amber-500 space-x-1">
        <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
        <span className="text-gray-700 font-medium">{product.averageRating?.toFixed(1) || '0.0'}</span>
        <span className="text-gray-400">({product.totalReviews || 0})</span>
      </div>

      <div className="mt-auto pt-3 flex justify-between items-center border-t border-gray-50">
        <div className="flex items-baseline gap-1.5">
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
          )}
          <span className="text-base font-black text-siddha-dark">
            ₹{hasDiscount ? product.discountPrice : product.price}
          </span>
        </div>

        <button
          onClick={() => onAddToCart?.(product)}
          className="px-3 py-1.5 bg-siddha-light hover:bg-[#cbfcd9] text-siddha-dark rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{lang === 'ta' ? 'வாங்க' : 'Add'}</span>
        </button>
      </div>
    </div>
  );
}
