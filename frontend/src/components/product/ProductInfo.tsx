import { Star, CheckCircle2, Heart } from "lucide-react";

interface ProductInfoProps {
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  price: number;
  discountPrice: number;
  description: string;
  stock: number;
  inWishlist: boolean;
  onToggleWishlist: () => void;
}

export default function ProductInfo({
  name, category, rating, reviewCount,
  price, discountPrice, description, stock,
  inWishlist, onToggleWishlist,
}: ProductInfoProps) {
  const hasDiscount = discountPrice < price;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start gap-3">
        <div>
          <span className="text-xs bg-siddha-light text-siddha-dark font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {category}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-emerald-950 tracking-tight leading-tight mt-2.5">
            {name}
          </h1>
        </div>
        <button
          onClick={onToggleWishlist}
          className={`p-3 rounded-full border border-gray-150 transition-colors shrink-0 cursor-pointer ${inWishlist ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-white text-gray-400 hover:text-rose-600"}`}
          title="Save product to wishlist"
        >
          <Heart className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="flex items-center space-x-2 text-xs text-amber-500 font-bold">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 fill-current ${i < Math.floor(rating) ? "text-amber-400" : "text-gray-200"}`}
            />
          ))}
        </div>
        <span className="text-gray-800 ml-1">{rating} / 5.0</span>
        <span className="text-gray-450 font-semibold">({reviewCount} Verified Reviews)</span>
      </div>

      <div className="flex items-baseline space-x-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 w-fit">
        <span className="text-2xl font-black text-siddha-dark">₹{discountPrice}</span>
        {hasDiscount && (
          <>
            <span className="text-sm font-semibold text-gray-400 line-through">₹{price}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Save ₹{price - discountPrice}
            </span>
          </>
        )}
      </div>

      <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-light">
        {description}
      </p>

      <div className="flex items-center space-x-1.5 text-xs font-bold">
        <span className="text-gray-400 uppercase">Availability State:</span>
        {stock > 0 ? (
          <span className="text-emerald-700 flex items-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-0.5" />
            In Stock ({stock} pieces left)
          </span>
        ) : (
          <span className="text-rose-600">Sold out</span>
        )}
      </div>
    </div>
  );
}
