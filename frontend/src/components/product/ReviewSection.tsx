import { useState } from "react";
import { Star, Send } from "lucide-react";

interface Review {
  id?: string;
  _id?: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewSectionProps {
  productId: string;
  reviews: Review[];
}

export default function ReviewSection({ productId, reviews: initialReviews }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const savedUser = localStorage.getItem("siddha_user");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (savedUser) {
        const u = JSON.parse(savedUser);
        headers["Authorization"] = `Bearer ${u._id}`;
      }

      const res = await fetch(`/api/products/${productId}/review`, {
        method: "POST",
        headers,
        body: JSON.stringify({ rating, comment }),
      });

      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setComment("");
        setSuccess("Review submitted successfully! Thank you for sharing your healing feedback.");
        setTimeout(() => setSuccess(""), 5000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 space-y-6">
        <h3 className="text-lg font-bold text-emerald-950 font-display">
          Buyer Feedback ({reviews.length})
        </h3>

        {reviews.length > 0 ? (
          <div className="space-y-4 divide-y divide-gray-100">
            {reviews.map((rev, idx) => (
              <div key={rev.id || rev._id || idx} className="pt-4 first:pt-0 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-6 h-6 rounded-full bg-siddha-light text-siddha-dark flex items-center justify-center font-bold text-[10px]">
                      {rev.user.substring(0, 1)}
                    </div>
                    <span className="font-bold text-gray-700">{rev.user}</span>
                    <span className="text-emerald-700 bg-emerald-50 text-[9px] px-1.5 rounded font-black uppercase">Verified Buyer</span>
                  </div>
                  <span className="text-gray-400 font-semibold">{rev.date}</span>
                </div>

                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 fill-current ${i < rev.rating ? "text-amber-400" : "text-gray-200"}`} />
                  ))}
                </div>

                <p className="text-xs text-gray-500 italic leading-relaxed">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <p className="text-xs text-gray-400">No review comments yet. Be the first to try this remedy and leave a testimony!</p>
          </div>
        )}
      </div>

      <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 space-y-4 h-fit">
        <h3 className="text-lg font-bold text-emerald-950 font-display">Write a Testimony</h3>
        <p className="text-[11px] text-gray-400 block uppercase font-bold tracking-widest leading-none">Share physical health shifts with the clinic</p>

        {success && (
          <p className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-xl text-xs font-semibold">{success}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-400 uppercase">Remedy Rating</label>
            <div className="flex space-x-1.5">
              {[1, 2, 3, 4, 5].map((starVal) => (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setRating(starVal)}
                  className="p-1 cursor-pointer transition-transform duration-100 hover:scale-110"
                >
                  <Star className={`w-6 h-6 fill-current ${rating >= starVal ? "text-amber-400" : "text-gray-200"}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-400 uppercase">Review Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ex. Restored my morning digestion. Highly recommend with warm water!"
              rows={4}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none placeholder-gray-400 text-gray-800 transition-colors resize-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-siddha-dark hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm"
            disabled={!comment.trim()}
          >
            <Send className="w-4 h-4" />
            <span>Submit Testimony</span>
          </button>
        </form>
      </div>
    </section>
  );
}
