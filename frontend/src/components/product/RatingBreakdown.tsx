import { Star } from "lucide-react";
import { ReviewStats } from "../../types";

interface RatingBreakdownProps {
  stats: ReviewStats;
  averageRating: number;
  onFilterRating?: (rating: number | null) => void;
  activeRating?: number | null;
}

const STAR_LABELS = [5, 4, 3, 2, 1];

export function RatingBreakdown({ stats, averageRating, onFilterRating, activeRating }: RatingBreakdownProps) {
  const { totalReviews, rating1, rating2, rating3, rating4, rating5 } = stats;
  const countMap = { 1: rating1, 2: rating2, 3: rating3, 4: rating4, 5: rating5 };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-3">
          <span className="text-4xl font-black text-gray-800">{averageRating.toFixed(1)}</span>
          <div className="space-y-0.5">
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(averageRating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400 font-medium block">
              {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {STAR_LABELS.map((star) => {
          const count = countMap[star as keyof typeof countMap];
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          const isActive = activeRating === star;

          return (
            <button
              key={star}
              onClick={() => onFilterRating?.(isActive ? null : star)}
              className={`w-full flex items-center gap-2 text-sm group cursor-pointer ${
                onFilterRating ? "hover:opacity-80" : ""
              }`}
              disabled={!onFilterRating}
            >
              <span className="w-16 text-right text-xs font-medium text-gray-500 shrink-0">
                {star} <Star className="w-3 h-3 inline text-amber-400 fill-amber-400" />
              </span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isActive ? "bg-amber-500" : "bg-amber-400"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-12 text-xs font-medium text-gray-400 shrink-0 text-right">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
