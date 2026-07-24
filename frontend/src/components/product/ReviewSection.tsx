import { useState, useEffect, useCallback } from "react";
import { Review, ReviewStats, ReviewFormData, PaginatedReviews } from "../../types";
import { RatingBreakdown } from "./RatingBreakdown";
import { ReviewList } from "./ReviewList";
import { ReviewPagination } from "./ReviewPagination";
import { ReviewForm } from "./ReviewForm";
import { fetchProductReviewsApi, fetchReviewStatsApi, createReviewApi, markHelpfulApi } from "../../api/reviews";
import { MessageSquarePlus } from "lucide-react";

interface ReviewSectionProps {
  productId: string;
  initialStats?: ReviewStats;
}

export default function ReviewSection({ productId, initialStats }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(initialStats || null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sort, setSort] = useState("newest");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const result: PaginatedReviews = await fetchProductReviewsApi(productId, {
        page,
        limit: 10,
        rating: filterRating || undefined,
        sort,
      });
      setReviews(result.reviews);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId, page, filterRating, sort]);

  const fetchStats = useCallback(async () => {
    try {
      const s = await fetchReviewStatsApi(productId);


      setStats(s);
    } catch {
      // silent
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [fetchReviews, fetchStats]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterRating = (rating: number | null) => {
    setFilterRating(rating);
    setPage(1);
  };

  const handleSubmitReview = async (data: ReviewFormData) => {
    setSubmitting(true);
    try {
      const result = await createReviewApi(productId, data);
      if (result?.review) {
        setShowForm(false);
        fetchReviews();
        fetchStats();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      await markHelpfulApi(productId, reviewId);
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
        )
      );
    } catch {
      // silent
    }
  };

  return (
    <section className="mt-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Rating Breakdown */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 p-6 h-fit">
          <RatingBreakdown
            stats={stats || { averageRating: 0, totalReviews: 0, rating1: 0, rating2: 0, rating3: 0, rating4: 0, rating5: 0 }}
            averageRating={stats?.averageRating || 0}
            onFilterRating={handleFilterRating}
            activeRating={filterRating}
          />
        </div>

        {/* Right: Review list */}
        <div className="lg:col-span-8 space-y-5">
          {/* Header bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-800">
                Reviews
              </h3>
              {filterRating && (
                <span className="text-xs text-gray-400">
                  (filtered by {filterRating} star)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>

              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                {showForm ? "Cancel" : "Write a Review"}
              </button>
            </div>
          </div>

          {/* Review form */}
          {showForm && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h4 className="font-bold text-gray-800 mb-4">Share Your Experience</h4>
              <ReviewForm onSubmit={handleSubmitReview} isSubmitting={submitting} />
            </div>
          )}

          {/* Review list */}
          <ReviewList
            reviews={reviews}
            loading={loading}
            onHelpful={handleHelpful}
            emptyMessage={
              filterRating
                ? `No ${filterRating}-star reviews yet.`
                : "Be the first to share your experience with this product."
            }
          />

          {/* Pagination */}
          <ReviewPagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </section>
  );
}
