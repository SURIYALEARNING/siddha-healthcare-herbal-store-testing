import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      onClick={() => navigate(`/products/${product._id}`)}
      className="rounded-2xl overflow-hidden shadow-md bg-white select-none h-64 sm:h-72 group cursor-pointer relative"
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
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-10">
        <h3 className="text-white font-bold text-sm truncate">{name}</h3>
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
