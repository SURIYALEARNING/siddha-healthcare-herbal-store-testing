import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Eye, CheckCircle, XCircle, MessageSquare, ArrowLeft, ChevronLeft, ChevronRight, Search,
} from "lucide-react";
import { useToastContext } from "../../context/ToastContext";
import {
  fetchAdminReviewsApi, fetchReviewUsersApi, fetchReviewsByUserApi,
  approveReviewAdminApi, rejectReviewApi, replyToReviewApi,
} from "../../api/reviews";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Spinner } from "../ui/Spinner";
import { RatingStars } from "../product/RatingStars";
import type { Review, ReviewUser } from "../../types";

function getInitials(name: string) {
  return name.charAt(0).toUpperCase();
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString();
}

type PageView = "pending" | "users" | "userDetail";

export default function ReviewTab() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToastContext();

  const [view, setView] = useState<PageView>("pending");

  // Pending reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Review users state
  const [reviewUsers, setReviewUsers] = useState<ReviewUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // User detail state
  const [selectedUser, setSelectedUser] = useState<ReviewUser | null>(null);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [userReviewsLoading, setUserReviewsLoading] = useState(false);

  // Detail modal
  const [detailReview, setDetailReview] = useState<Review | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Reply modal
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyReview, setReplyReview] = useState<Review | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminReviewsApi({ status: "pending", page, limit: 15 });
      if (data) {
        setReviews(data.reviews || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const data = await fetchReviewUsersApi();
      setReviewUsers(data || []);
    } catch {
      setReviewUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => { if (view === "pending") loadReviews(); }, [view, loadReviews]);
  useEffect(() => { if (view === "users") loadUsers(); }, [view, loadUsers]);

  const openUserDetail = async (u: ReviewUser) => {
    setSelectedUser(u);
    setUserReviewsLoading(true);
    setView("userDetail");
    try {
      const data = await fetchReviewsByUserApi(u.userId);
      setUserReviews(data || []);
    } catch {
      setUserReviews([]);
    } finally {
      setUserReviewsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveReviewAdminApi(id);
      showSuccess("Success", "Review approved and is now visible on the product page.");
      if (view === "pending") loadReviews();
      if (view === "userDetail" && selectedUser) {
        const data = await fetchReviewsByUserApi(selectedUser.userId);
        setUserReviews(data || []);
      }
    } catch (e: any) {
      console.error("Review approve error:", e); showError("Error", "Failed to approve review.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectReviewApi(id);
      showSuccess("Success", "Review rejected.");
      if (view === "pending") loadReviews();
      if (view === "userDetail" && selectedUser) {
        const data = await fetchReviewsByUserApi(selectedUser.userId);
        setUserReviews(data || []);
      }
    } catch (e: any) {
      console.error("Review reject error:", e); showError("Error", "Failed to reject review.");
    }
  };

  const openReply = (r: Review) => {
    setReplyReview(r);
    setReplyMessage(r.adminReply?.message || "");
    setReplyOpen(true);
  };

  const handleReply = async () => {
    if (!replyReview || !replyMessage.trim()) return;
    setReplySubmitting(true);
    try {
      await replyToReviewApi(replyReview._id, replyMessage.trim());
      showSuccess("Success", "Reply added to review.");
      setReplyOpen(false);
      if (view === "pending") loadReviews();
      if (view === "userDetail" && selectedUser) {
        const data = await fetchReviewsByUserApi(selectedUser.userId);
        setUserReviews(data || []);
      }
      setDetailReview((prev) => prev ? { ...prev, adminReply: { message: replyMessage.trim() } } : null);
    } catch (e: any) {
      console.error("Review reply error:", e); showError("Error", "Failed to reply.");
    } finally {
      setReplySubmitting(false);
    }
  };

  const openDetail = (r: Review) => {
    setDetailReview(r);
    setDetailOpen(true);
  };

  const statusBadge = (review: Review) => {
    if (review.isApproved) {
      return <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">Approved</span>;
    }
    if (review.adminReply?.message) {
      return <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">Replied</span>;
    }
    return <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">Pending</span>;
  };

  // PENDING REVIEWS VIEW
  if (view === "pending") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("users")}
            className="text-xs font-bold text-siddha-dark hover:text-siddha-gold transition-colors cursor-pointer underline underline-offset-2"
          >
            View Review Users →
          </button>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-display text-emerald-900">
              Pending Reviews ({total})
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : reviews.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No pending reviews.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 uppercase font-black tracking-widest text-[10px]">
                    <th className="py-3 pr-4">Customer</th>
                    <th className="py-3 pr-4">Product</th>
                    <th className="py-3 pr-4">Rating</th>
                    <th className="py-3 pr-4">Review</th>
                    <th className="py-3 pr-4">Date</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reviews.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50/50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {getInitials(r.userName)}
                          </div>
                          <span className="text-xs font-semibold">{r.userName}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-xs truncate max-w-[150px]">
                        {r.productId?.name?.en || r.productId?.name || "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <RatingStars rating={r.rating} size="sm" />
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-500 truncate max-w-[200px]">
                        {r.comment}
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-400">{formatDate(r.createdAt)}</td>
                      <td className="py-3 pr-4">{statusBadge(r)}</td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openDetail(r)} className="p-1.5 text-gray-400 hover:text-siddha-dark cursor-pointer" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleApprove(r._id)} className="p-1.5 text-gray-400 hover:text-emerald-600 cursor-pointer" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleReject(r._id)} className="p-1.5 text-gray-400 hover:text-rose-600 cursor-pointer" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => openReply(r)} className="p-1.5 text-gray-400 hover:text-blue-600 cursor-pointer" title="Reply">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 text-gray-400 hover:text-siddha-dark disabled:opacity-30 cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 text-gray-400 hover:text-siddha-dark disabled:opacity-30 cursor-pointer">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Review Details" size="md">
          {detailReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="font-bold text-gray-400 block text-[10px] uppercase">Customer</span>{detailReview.userName}</div>
                <div><span className="font-bold text-gray-400 block text-[10px] uppercase">Product</span>{detailReview.productId?.name?.en || detailReview.productId?.name || "—"}</div>
                <div><span className="font-bold text-gray-400 block text-[10px] uppercase">Rating</span><RatingStars rating={detailReview.rating} size="sm" /></div>
                <div><span className="font-bold text-gray-400 block text-[10px] uppercase">Date</span>{formatDate(detailReview.createdAt)}</div>
                <div><span className="font-bold text-gray-400 block text-[10px] uppercase">Status</span>{statusBadge(detailReview)}</div>
              </div>
              {detailReview.title && (
                <div className="text-xs"><span className="font-bold text-gray-400 block text-[10px] uppercase">Title</span>{detailReview.title}</div>
              )}
              <div className="text-xs"><span className="font-bold text-gray-400 block text-[10px] uppercase">Comment</span><p className="mt-1 text-gray-600">{detailReview.comment}</p></div>
              {detailReview.images && detailReview.images.length > 0 && (
                <div>
                  <span className="font-bold text-gray-400 block text-[10px] uppercase mb-1">Images</span>
                  <div className="flex gap-2">
                    {detailReview.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="w-16 h-16 rounded-lg object-cover border" />
                    ))}
                  </div>
                </div>
              )}
              {detailReview.adminReply?.message && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs">
                  <span className="font-bold text-blue-700 block text-[10px] uppercase mb-1">Admin Reply</span>
                  <p className="text-blue-900">{detailReview.adminReply.message}</p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                {!detailReview.isApproved && (
                  <Button variant="primary" size="sm" onClick={() => { handleApprove(detailReview._id); setDetailOpen(false); }}>
                    <CheckCircle className="w-3.5 h-3.5 mr-1 inline" /> Approve
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => { openReply(detailReview); }}>
                  <MessageSquare className="w-3.5 h-3.5 mr-1 inline" /> Reply
                </Button>
                {detailReview.isApproved && (
                  <Button variant="secondary" size="sm" onClick={() => { handleReject(detailReview._id); setDetailOpen(false); }}>
                    <XCircle className="w-3.5 h-3.5 mr-1 inline" /> Reject
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Reply Modal */}
        <Modal isOpen={replyOpen} onClose={() => setReplyOpen(false)} title="Reply to Review" size="sm">
          {replyReview && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1">
                <p><span className="font-bold">Review by:</span> {replyReview.userName}</p>
                <p className="text-gray-500 italic">"{replyReview.comment}"</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Your Reply *</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full p-2.5 border border-gray-150 rounded-xl text-xs resize-none"
                  rows={3}
                  placeholder="Write your response..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setReplyOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleReply} loading={replySubmitting} disabled={!replyMessage.trim()}>
                  <MessageSquare className="w-3.5 h-3.5 mr-1 inline" /> Submit Reply
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  // REVIEW USERS VIEW
  if (view === "users") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("pending")}
            className="text-xs font-bold text-siddha-dark hover:text-siddha-gold transition-colors cursor-pointer underline underline-offset-2"
          >
            ← Pending Reviews
          </button>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-bold font-display text-emerald-900">
            Review Users ({reviewUsers.length})
          </h2>

          {usersLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : reviewUsers.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No review users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 uppercase font-black tracking-widest text-[10px]">
                    <th className="py-3 pr-4">Avatar</th>
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Total Reviews</th>
                    <th className="py-3 pr-4">Pending</th>
                    <th className="py-3 pr-4">Approved</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reviewUsers.map((u) => (
                    <tr key={u.userId} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => openUserDetail(u)}>
                      <td className="py-3 pr-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          {getInitials(u.userName)}
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-xs">{u.userName}</td>
                      <td className="py-3 pr-4 font-mono text-sm font-bold">{u.totalReviews}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${u.pendingReviews > 0 ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                          {u.pendingReviews}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          {u.approvedReviews}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button className="p-1.5 text-gray-400 hover:text-siddha-dark cursor-pointer" title="View Reviews">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // USER DETAIL VIEW
  if (view === "userDetail" && selectedUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setView("users"); setSelectedUser(null); }}
            className="text-xs font-bold text-siddha-dark hover:text-siddha-gold transition-colors cursor-pointer underline underline-offset-2"
          >
            ← Review Users
          </button>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-sm">
              {getInitials(selectedUser.userName)}
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-emerald-900">{selectedUser.userName}</h2>
              <p className="text-xs text-gray-400">{selectedUser.totalReviews} reviews ({selectedUser.pendingReviews} pending, {selectedUser.approvedReviews} approved)</p>
            </div>
          </div>

          {userReviewsLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : userReviews.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No reviews found.</p>
          ) : (
            <div className="space-y-4">
              {userReviews.map((r) => (
                <div key={r._id} className="border border-gray-100 rounded-2xl p-4 space-y-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {r.productId?.name?.en || r.productId?.name || "Unknown Product"}
                      </p>
                      <RatingStars rating={r.rating} size="sm" />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {statusBadge(r)}
                      <span className="text-[10px] text-gray-400">{formatDate(r.createdAt)}</span>
                    </div>
                  </div>

                  {r.title && <p className="text-xs font-semibold text-gray-700">{r.title}</p>}
                  <p className="text-xs text-gray-500">{r.comment}</p>

                  {r.images && r.images.length > 0 && (
                    <div className="flex gap-2">
                      {r.images.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-12 h-12 rounded-lg object-cover border" />
                      ))}
                    </div>
                  )}

                  {r.adminReply?.message && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs">
                      <span className="font-bold text-blue-700 block text-[10px] uppercase mb-1">Admin Reply</span>
                      <p className="text-blue-900">{r.adminReply.message}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    {!r.isApproved && (
                      <button onClick={() => handleApprove(r._id)} className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer">
                        <CheckCircle className="w-3 h-3" /> Approve
                      </button>
                    )}
                    {r.isApproved && (
                      <button onClick={() => handleReject(r._id)} className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer">
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    )}
                    <button onClick={() => openReply(r)} className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
                      <MessageSquare className="w-3 h-3" /> {r.adminReply?.message ? "Edit Reply" : "Reply"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Modal */}
        <Modal isOpen={replyOpen} onClose={() => setReplyOpen(false)} title="Reply to Review" size="sm">
          {replyReview && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1">
                <p><span className="font-bold">Review by:</span> {replyReview.userName}</p>
                <p className="text-gray-500 italic">"{replyReview.comment}"</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Your Reply *</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full p-2.5 border border-gray-150 rounded-xl text-xs resize-none"
                  rows={3}
                  placeholder="Write your response..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setReplyOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleReply} loading={replySubmitting} disabled={!replyMessage.trim()}>
                  <MessageSquare className="w-3.5 h-3.5 mr-1 inline" /> Submit Reply
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  return null;
}
