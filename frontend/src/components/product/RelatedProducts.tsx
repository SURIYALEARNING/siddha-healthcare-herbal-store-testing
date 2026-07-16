import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import type { Product } from "../../types";

interface RelatedProductsProps {
  products: Product[];
  isInWishlist: (id: string) => boolean;
  onToggleWishlist: (id: string) => void;
}

export default function RelatedProducts({ products, isInWishlist, onToggleWishlist }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-16 space-y-8">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-emerald-950 font-display">Related Traditional Remedies</h2>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mt-1">Siddhars highly recommend marrying these associated cures</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {products.map((p) => {
          const inFav = isInWishlist(p._id);
          const isDiscounted = p.discountPrice < p.price;

          return (
            <div
              key={p._id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-emerald-100 transition-all p-4 group flex flex-col hover:shadow-md relative"
            >
              <button
                onClick={() => onToggleWishlist(p._id)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/80 text-rose-600 hover:bg-white z-10 cursor-pointer shadow-xs"
              >
                <Heart className={`w-3.5 h-3.5 ${inFav ? "fill-rose-500" : ""}`} />
              </button>

              <div className="w-full h-40 overflow-hidden rounded-xl bg-slate-50 mb-4">
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>

              <Link to={`/products/${p._id}`} className="group-hover:text-siddha-dark transition-colors">
                <h4 className="font-bold text-emerald-950 text-xs sm:text-sm lines-clamp-2 min-h-10 leading-tight">
                  {p.name}
                </h4>
              </Link>

              <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-50">
                <span className="text-base font-black text-siddha-dark">₹{p.discountPrice}</span>
                <Link to={`/products/${p._id}`} className="text-xs font-semibold text-emerald-700 hover:underline">
                  See Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
