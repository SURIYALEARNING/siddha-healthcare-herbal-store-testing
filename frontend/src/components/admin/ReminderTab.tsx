import { useEffect, useState, useCallback } from "react";
import { Search, Phone, PhoneOff, Eye, MessageCircle, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useToastContext } from "../../context/ToastContext";
import {
  fetchReminders, fetchReminderStats, fetchReminderById,
  completeCall, updateWhatsappStatus,
} from "../../api/reminders";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Spinner } from "../ui/Spinner";
import StatsCard from "./StatsCard";
import type { Reminder, ReminderStats } from "../../types";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "WHATSAPP_SENT", label: "WhatsApp Sent" },
  { value: "CALL_PENDING", label: "Call Pending" },
  { value: "CALL_COMPLETED", label: "Call Completed" },
  { value: "PURCHASED_AGAIN", label: "Purchased Again" },
  { value: "CLOSED", label: "Closed" },
];

const PERIOD_OPTIONS = [
  { value: "", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "week", label: "This Week" },
];

export default function ReminderTab() {
  const { showSuccess, showError } = useToastContext();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [stats, setStats] = useState<ReminderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailReminder, setDetailReminder] = useState<Reminder | null>(null);

  const [showCallDialog, setShowCallDialog] = useState(false);
  const [callResult, setCallResult] = useState("PURCHASED_AGAIN");
  const [callNotes, setCallNotes] = useState("");
  const [callSubmitting, setCallSubmitting] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchReminderStats();
      setStats(data);
    } catch { }
  }, []);

  const loadReminders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchReminders({
        status: statusFilter || undefined,
        period: periodFilter || undefined,
        search: search || undefined,
        page,
        limit: 20,
        sort: "newest",
      });
      setReminders(data.reminders || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      setReminders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, periodFilter, search, page]);

  useEffect(() => { loadReminders(); }, [loadReminders]);
  useEffect(() => { loadStats(); }, [loadStats]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const data = await fetchReminderById(id);
      setDetailReminder(data);
    } catch {
      showError("Error", "Failed to load reminder details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const openCallDialog = (r: Reminder) => {
    setSelectedReminder(r);
    setCallResult("PURCHASED_AGAIN");
    setCallNotes("");
    setShowCallDialog(true);
  };

  const handleCompleteCall = async () => {
    if (!selectedReminder) return;
    setCallSubmitting(true);
    try {
      await completeCall(selectedReminder._id, { callResult, callNotes });
      showSuccess("Success", "Call completed successfully.");
      setShowCallDialog(false);
      loadReminders();
      loadStats();
      if (detailReminder?._id === selectedReminder._id) {
        openDetail(selectedReminder._id);
      }
    } catch (e: any) {
      console.error("Reminder complete call error:", e); showError("Error", "Failed to complete call.");
    } finally {
      setCallSubmitting(false);
    }
  };

  const handleMarkWhatsappSent = async (id: string) => {
    try {
      await updateWhatsappStatus(id, { status: "SENT", whatsappStatus: "SENT" });
      showSuccess("Success", "Marked as WhatsApp sent.");
      loadReminders();
      loadStats();
    } catch (e: any) {
      console.error("Reminder update error:", e); showError("Error", "Failed to update.");
    }
  };

  const callResultOptions = [
    { value: "PURCHASED_AGAIN", label: "Purchased Again" },
    { value: "NOT_INTERESTED", label: "Not Interested" },
    { value: "NO_RESPONSE", label: "No Response" },
    { value: "WRONG_NUMBER", label: "Wrong Number" },
    { value: "CALL_LATER", label: "Call Later" },
    { value: "OTHER", label: "Other" },
  ];

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-amber-50 text-amber-700",
      WHATSAPP_SENT: "bg-blue-50 text-blue-700",
      CALL_PENDING: "bg-purple-50 text-purple-700",
      CALL_COMPLETED: "bg-emerald-50 text-emerald-700",
      PURCHASED_AGAIN: "bg-teal-50 text-teal-700",
      CLOSED: "bg-gray-100 text-gray-500",
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${colors[status] || "bg-gray-100 text-gray-500"}`}>
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  if (detailReminder && !showCallDialog) {
    const r = detailReminder;
    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { setDetailReminder(null); }} className="p-1.5 text-gray-400 hover:text-siddha-dark cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold font-display text-emerald-900">Reminder Details</h2>
          </div>
          {r.callStatus !== "PURCHASED_AGAIN" && r.status !== "CLOSED" && (
            <Button variant="primary" size="sm" onClick={() => openCallDialog(r as any)}>
              <Phone className="w-3.5 h-3.5 mr-1 inline" /> Complete Call
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Customer Name</p>
            <p className="text-sm font-semibold mt-0.5">{r.customerId?.fullName || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Mobile Number</p>
            <p className="text-sm font-semibold mt-0.5">{r.customerId?.mobileNumber || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Email</p>
            <p className="text-sm mt-0.5">{r.customerId?.email || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Status</p>
            <div className="mt-0.5">{statusBadge(r.status)}</div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Product</p>
            <p className="text-sm font-semibold mt-0.5">{r.productId?.name?.en || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Quantity</p>
            <p className="text-sm mt-0.5">{r.quantity}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Purchase Date</p>
            <p className="text-sm mt-0.5">{new Date(r.purchaseDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Reminder Date</p>
            <p className="text-sm font-bold text-amber-700 mt-0.5">{new Date(r.reminderDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Reminder Days</p>
            <p className="text-sm mt-0.5">{r.reminderDays} days</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">WhatsApp Status</p>
            <p className="text-sm mt-0.5">{r.whatsappStatus}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Call Status</p>
            <p className="text-sm mt-0.5">{r.callStatus}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Call Notes</p>
            <p className="text-sm mt-0.5">{r.callNotes || "—"}</p>
          </div>
        </div>

        {r.status === "PENDING" && (
          <Button variant="secondary" size="sm" onClick={() => handleMarkWhatsappSent(r._id)}>
            <MessageCircle className="w-3.5 h-3.5 mr-1 inline" /> Mark WhatsApp Sent
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            label="Today Pending"
            value={stats.todayPending}
            footer="Awaiting WhatsApp"
            footerColor="text-amber-600"
          />
          <StatsCard
            label="Today WhatsApp Sent"
            value={stats.todayWhatsappSent}
            footer="Awaiting call"
            footerColor="text-blue-600"
          />
          <StatsCard
            label="Today Call Pending"
            value={stats.todayCallPending}
            footer="Call to be made"
            footerColor="text-purple-600"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customer, product..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 border border-gray-150 rounded-xl text-xs bg-gray-50"
          />
        </div>
        <select
          value={periodFilter}
          onChange={(e) => { setPeriodFilter(e.target.value); setPage(1); }}
          className="p-2 border border-gray-150 rounded-xl text-xs bg-gray-50 cursor-pointer"
        >
          {PERIOD_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="p-2 border border-gray-150 rounded-xl text-xs bg-gray-50 cursor-pointer"
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Reminder List */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-emerald-900">
            Medicine Reminders ({total})
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : reminders.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No reminders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 uppercase font-black tracking-widest text-[10px]">
                  <th className="py-3 pr-4">Customer</th>
                  <th className="py-3 pr-4">Mobile</th>
                  <th className="py-3 pr-4">Product</th>
                  <th className="py-3 pr-4">Reminder Date</th>
                  <th className="py-3 pr-4">WhatsApp</th>
                  <th className="py-3 pr-4">Call</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reminders.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/50">
                    <td className="py-3 pr-4 font-semibold text-xs">{r.customerId?.fullName || "—"}</td>
                    <td className="py-3 pr-4 text-xs">{r.customerId?.mobileNumber || "—"}</td>
                    <td className="py-3 pr-4 text-xs truncate max-w-[150px]">{r.productId?.name?.en || "—"}</td>
                    <td className="py-3 pr-4 text-xs font-mono">{new Date(r.reminderDate).toLocaleDateString()}</td>
                    <td className="py-3 pr-4 text-xs">{r.whatsappStatus}</td>
                    <td className="py-3 pr-4 text-xs">{r.callStatus.replace(/_/g, " ")}</td>
                    <td className="py-3 pr-4">{statusBadge(r.status)}</td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openDetail(r._id)}
                          className="p-1.5 text-gray-400 hover:text-siddha-dark cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {r.status !== "CLOSED" && r.callStatus !== "PURCHASED_AGAIN" && (
                          <button
                            onClick={() => openCallDialog(r)}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 cursor-pointer"
                            title="Complete Call"
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 text-gray-400 hover:text-siddha-dark disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 text-gray-400 hover:text-siddha-dark disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Complete Call Dialog */}
      <Modal isOpen={showCallDialog} onClose={() => setShowCallDialog(false)} title="Complete Call" size="sm">
        {selectedReminder && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1">
              <p><span className="font-bold">Customer:</span> {selectedReminder.customerId?.fullName}</p>
              <p><span className="font-bold">Mobile:</span> {selectedReminder.customerId?.mobileNumber}</p>
              <p><span className="font-bold">Product:</span> {selectedReminder.productId?.name?.en}</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Call Result *</label>
              <select
                value={callResult}
                onChange={(e) => setCallResult(e.target.value)}
                className="w-full p-2.5 border border-gray-150 rounded-xl text-xs bg-white cursor-pointer"
              >
                {callResultOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Notes (optional)</label>
              <textarea
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                className="w-full p-2.5 border border-gray-150 rounded-xl text-xs resize-none"
                rows={2}
                placeholder="Call outcome notes..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setShowCallDialog(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCompleteCall} loading={callSubmitting}>
                <PhoneOff className="w-3.5 h-3.5 mr-1 inline" /> Complete Call
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Detail Loading */}
      <Modal isOpen={detailLoading} onClose={() => setDetailLoading(false)} title="Loading" size="sm">
        <div className="flex justify-center py-8"><Spinner /></div>
      </Modal>
    </div>
  );
}
