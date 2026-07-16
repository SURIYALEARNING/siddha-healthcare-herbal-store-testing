import { useState } from "react";
import { ShoppingBag } from "lucide-react";

interface ProductActionsProps {
  stock: number;
  onAddToCart: (quantity: number) => void;
  onBuyNow: (quantity: number) => void;
}

export default function ProductActions({ stock, onAddToCart, onBuyNow }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);

  if (stock <= 0) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center">
        <p className="text-xs font-bold text-rose-700">Currently out of stock</p>
        <p className="text-[10px] text-rose-600/80 mt-1">Our siddhars are sorting ingredients for a brand new batch. Ask Agathiyar AI on the corner for restock timelines!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4 border-t border-gray-50">
      <div className="flex items-center space-x-3">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quantity:</span>
        <div className="flex items-center border border-gray-200 rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-1 bg-gray-50 text-gray-600 font-bold text-sm select-none cursor-pointer"
          >
            -
          </button>
          <span className="px-4 py-1 text-xs font-bold text-gray-800 select-none">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(stock, quantity + 1))}
            className="px-3 py-1 bg-gray-50 text-gray-600 font-bold text-sm select-none cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <button
          onClick={() => onAddToCart(quantity)}
          className="w-full py-3.5 px-6 bg-siddha-light hover:bg-[#cbfcd9] text-siddha-dark font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add to Shopping Bag</span>
        </button>
        <button
          onClick={() => onBuyNow(quantity)}
          className="w-full py-3.5 px-6 bg-siddha-dark hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-950/10"
        >
          Buy Remedy Now
        </button>
      </div>
    </div>
  );
}
