import { ThumbsUp } from "lucide-react";
import { Review } from "../../types";
import { RatingStars } from "./RatingStars";
import { VerifiedPurchaseBadge } from "./VerifiedPurchaseBadge";

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string) => void;
  isOwn?: boolean;
}

function getInitials(name: string) {
  return name.charAt(0).toUpperCase();
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

export function ReviewCard({ review, onHelpful, isOwn }: ReviewCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 transition-all duration-200 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
            {getInitials(review.userName)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-800 text-sm">{review.userName}</span>
              {review.isVerifiedPurchase && <VerifiedPurchaseBadge />}
            </div>
            <span className="text-[11px] text-gray-400">{formatDate(review.createdAt)}</span>
          </div>
        </div>
        {isOwn && (
          <span className="text-[10px] font-bold text-gray-400 uppercase shrink-0">Your Review</span>
        )}
      </div>

      <div>
        <RatingStars rating={review.rating} size="sm" />
      </div>

      {review.title && (
        <h4 className="font-semibold text-gray-800 text-sm">{review.title}</h4>
      )}

      <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
        {review.comment}
      </p>

      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {review.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="Review"
              className="w-16 h-16 rounded-lg object-cover border border-gray-100 shrink-0"
            />
          ))}
        </div>
      )}

      {onHelpful && (
        <button
          onClick={() => onHelpful(review._id)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer pt-1"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>Helpful ({review.helpfulCount || 0})</span>
        </button>
      )}
    </div>
  );
}
