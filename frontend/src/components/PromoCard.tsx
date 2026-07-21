import { motion } from "motion/react";
import { PromoItem } from "../types/promo";

interface PromoCardProps {
  item: PromoItem;
}

export default function PromoCard({ item }: PromoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl overflow-hidden shadow-md bg-white select-none h-64 sm:h-72"
    >
      <img
        src={item.image}
        alt=""
        loading="lazy"
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
}
