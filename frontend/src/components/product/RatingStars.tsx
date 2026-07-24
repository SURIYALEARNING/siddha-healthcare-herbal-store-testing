import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
  showValue?: boolean;
  count?: number;
}

const sizeMap = {
  sm: { star: "w-3 h-3", text: "text-xs" },
  md: { star: "w-4 h-4", text: "text-sm" },
  lg: { star: "w-5 h-5", text: "text-base" },
};

export function RatingStars({
  rating,
  maxStars = 5,
  size = "sm",
  interactive = false,
  onRate,
  showValue = false,
  count,
}: RatingStarsProps) {
  const s = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-1 ${interactive ? "cursor-pointer" : ""}`}>
      <div className="flex">
        {Array.from({ length: maxStars }, (_, i) => (
          <Star
            key={i}
            className={`${s.star} ${
              i < Math.round(rating)
                ? "text-amber-400 fill-amber-400"
                : "text-gray-200 fill-gray-200"
            } ${interactive ? "hover:scale-110 transition-transform" : ""}`}
            onClick={() => interactive && onRate?.(i + 1)}
          />
        ))}
      </div>
      {showValue && (
        <span className={`${s.text} font-bold text-gray-700 ml-1`}>
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-gray-400 font-medium">
          ({count})
        </span>
      )}
    </div>
  );
}
