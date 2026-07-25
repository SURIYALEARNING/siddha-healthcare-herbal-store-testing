import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 p-6 h-fit">
          <RatingBreakdown
            stats={stats || { averageRating: 0, totalReviews: 0, rating1: 0, rating2: 0, rating3: 0, rating4: 0, rating5: 0 }}
            averageRating={stats?.averageRating || 0}
            onFilterRating={handleFilterRating}
            activeRating={filterRating}
          />
        </div>

        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-800">
                {t('product.reviews')}
              </h3>
              {filterRating && (
                <span className="text-xs text-gray-400">
                  {t('productDetails.filteredByRating', { rating: filterRating })}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="newest">{t('productDetails.mostRecent')}</option>
                <option value="oldest">{t('productDetails.oldestFirst')}</option>
                <option value="highest">{t('productDetails.highestRating')}</option>
                <option value="lowest">{t('productDetails.lowestRating')}</option>
              </select>

              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                {showForm ? t('common.cancel') : t('product.writeReview')}
              </button>
            </div>
          </div>

          {showForm && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h4 className="font-bold text-gray-800 mb-4">{t('productDetails.shareExperience')}</h4>
              <ReviewForm onSubmit={handleSubmitReview} isSubmitting={submitting} />
            </div>
          )}

          <ReviewList
            reviews={reviews}
            loading={loading}
            onHelpful={handleHelpful}
            emptyMessage={
              filterRating
                ? t('productDetails.noStarReviews', { rating: filterRating })
                : t('productDetails.noReviews')
            }
          />

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
