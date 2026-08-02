import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import type { Product } from "../types";

function getTransValue(val: any, lang: string): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[lang] || val.en || "";
}

interface PromoCardProps {
  product: Product;
  lang: string;
}

export default function PromoCard({ product, lang }: PromoCardProps) {
  const navigate = useNavigate();
  const img = product.media?.[0]?.url || product.images?.[0] || "";
  const name = getTransValue(product.name, lang);
  const rating = product.reviewStats?.averageRating ?? product.averageRating ?? 0;
  const totalReviews = product.reviewStats?.totalReviews ?? product.totalReviews ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      onClick={() => navigate(`/products/${product._id}`)}
      className="rounded-2xl overflow-hidden shadow-md bg-white select-none group cursor-pointer relative aspect-square"
    >
      {img ? (
        <img
          src={img}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-sm">
          No image
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 pt-10">
        <h3 className="text-white font-bold text-sm truncate">{name}</h3>
        <div className="flex items-center gap-1 mt-1">
          <div className="flex">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-500 fill-gray-500/40"
                }`}
              />
            ))}
          </div>
          <span className="text-white text-[11px] font-bold">{rating || 0}</span>
          <span className="text-gray-300 text-[10px] font-semibold">({totalReviews || 0})</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-yellow-400 font-bold text-sm">₹{product.discountPrice}</span>
          {product.price > product.discountPrice && (
            <span className="text-gray-300 text-[10px] line-through">₹{product.price}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
