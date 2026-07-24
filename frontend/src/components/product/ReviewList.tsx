import { Review } from "../../types";
import { ReviewCard } from "./ReviewCard";
import { ReviewSkeleton } from "./ReviewSkeleton";

interface ReviewListProps {
  reviews: Review[];
  loading: boolean;
  onHelpful: (reviewId: string) => void;
  emptyMessage?: string;
}

export function ReviewList({ reviews, loading, onHelpful, emptyMessage }: ReviewListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <ReviewSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 border border-slate-100 rounded-2xl p-8">
        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
          <span className="text-2xl">💬</span>
        </div>
        <h4 className="font-bold text-gray-800 mb-1">No reviews yet</h4>
        <p className="text-xs text-gray-400 max-w-xs mx-auto">
          {emptyMessage || "Be the first to share your experience with this product."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review._id}
          review={review}
          onHelpful={onHelpful}
        />
      ))}
    </div>
  );
}
