import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import type { Product } from "../../types";

interface AccountWishlistProps {
  products: Product[];
}

export default function AccountWishlist({ products }: AccountWishlistProps) {
  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-gray-850 uppercase tracking-wider border-b border-gray-50 pb-2.5">Saved Healing Favorites</h3>
        <div className="text-center py-16 bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-3">
          <div className="w-12 h-12 bg-gray-105 rounded-full flex items-center justify-center mx-auto text-gray-405">
            <Heart className="w-6 h-6 text-gray-400" />
          </div>
          <h4 className="font-bold text-emerald-950">Wishlist empty</h4>
          <p className="text-xs text-gray-450 max-w-sm mx-auto">No remedies bookmarked. Browse our pharmacy and tap the heart icon to save.</p>
          <Link to="/shop" className="inline-block px-4 py-2 bg-siddha-dark text-white rounded-xl text-xs font-bold">Browse Remedies</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-gray-850 uppercase tracking-wider border-b border-gray-50 pb-2.5">Saved Healing Favorites</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map((p) => (
          <div key={p._id} className="border border-gray-150 rounded-2xl p-4 flex items-center space-x-3 hover:border-emerald-150 transition-all">
            <img src={p.images[0]} alt={p.name} className="w-16 h-16 object-cover rounded-xl bg-slate-50" />
            <div className="flex-1 min-w-0 space-y-1">
              <Link to={`/products/${p._id}`} className="hover:text-siddha-dark transition-colors">
                <h4 className="text-xs font-bold text-emerald-950 truncate leading-none mb-1">{p.name}</h4>
              </Link>
              <p className="text-[10px] text-gray-400 font-semibold leading-none uppercase">{p.category}</p>
              <div className="pt-1 select-none">
                <span className="text-xs font-black text-siddha-dark">₹{p.discountPrice}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Link to={`/products/${p._id}`} className="px-2.5 py-1 bg-siddha-light hover:bg-[#cbfcd9] text-siddha-dark text-[10px] font-bold rounded">
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
