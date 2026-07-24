import { useState } from "react";
import { Star, Send } from "lucide-react";
import { ReviewFormData } from "../../types";

interface ReviewFormProps {
  onSubmit: (data: ReviewFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: ReviewFormData;
  isSubmitting?: boolean;
}

export function ReviewForm({ onSubmit, onCancel, initialData, isSubmitting }: ReviewFormProps) {
  const [rating, setRating] = useState(initialData?.rating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(initialData?.title || "");
  const [comment, setComment] = useState(initialData?.comment || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || rating < 1) return;
    await onSubmit({ rating, title: title.trim(), comment: comment.trim() });
    if (!initialData) {
      setRating(5);
      setTitle("");
      setComment("");
    }
  };

  const isValid = comment.trim().length > 0 && rating >= 1;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
          Your Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform duration-100 hover:scale-110 cursor-pointer"
            >
              <Star
                className={`w-7 h-7 fill-current transition-colors ${
                  star <= (hoverRating || rating)
                    ? "text-amber-400"
                    : "text-gray-200"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
          Review Title (Optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white text-xs rounded-xl focus:outline-none placeholder-gray-400 text-gray-800 transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
          Your Review
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white text-xs rounded-xl focus:outline-none placeholder-gray-400 text-gray-800 transition-colors resize-none"
          required
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              {initialData ? "Update Review" : "Submit Review"}
            </>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
