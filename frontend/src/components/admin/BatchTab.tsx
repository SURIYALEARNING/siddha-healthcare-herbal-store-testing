import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Eye, Edit3, History, Package, ArrowDownUp } from "lucide-react";
import { useToastContext } from "../../context/ToastContext";
import {
  fetchBatchesApi, createBatchApi, updateBatchApi,
  adjustBatchStockApi, fetchBatchHistoryApi,
} from "../../api/batches";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Spinner } from "../ui/Spinner";
import type { Batch, StockAdjustment, Product } from "../../types";

function getTransValue(val: any, lang: string): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[lang] || val.en || "";
}

function getProductName(p: any, lang: string): string {
  if (!p) return "—";
  if (typeof p === "object") return getTransValue(p.name, lang);
  return String(p);
}

interface BatchTabProps {
  products: Product[];
}

type ViewMode = "list" | "create" | "edit" | "detail";

const EMPTY_FORM = {
  productId: "",
  batchNumber: "",
  quantityProduced: 0,
  manufactureDate: "",
  expiryDate: "",
  preparedBy: "",
  supervisedBy: "",
  approvedBy: "",
  status: "ACTIVE" as Batch["status"],
};

export default function BatchTab({ products }: BatchTabProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { showSuccess, showError } = useToastContext();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [adjustModal, setAdjustModal] = useState(false);
  const [adjustBatch, setAdjustBatch] = useState<Batch | null>(null);
  const [adjustNewStock, setAdjustNewStock] = useState(0);
  const [adjustReason, setAdjustReason] = useState("STOCK_CORRECTION");
  const [adjustDetails, setAdjustDetails] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  const [historyModal, setHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState<StockAdjustment[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadBatches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBatchesApi();
      setBatches(data);
    } catch { } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBatches(); }, [loadBatches]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setViewMode("create");
  };

  const openEdit = (b: Batch) => {
    setForm({
      productId: typeof b.productId === "string" ? b.productId : b.productId?._id || "",
      batchNumber: b.batchNumber,
      quantityProduced: b.quantityProduced,
      manufactureDate: b.manufactureDate?.split("T")[0] || "",
      expiryDate: b.expiryDate?.split("T")[0] || "",
      preparedBy: b.preparedBy || "",
      supervisedBy: b.supervisedBy || "",
      approvedBy: b.approvedBy || "",
      status: b.status,
    });
    setSelectedBatch(b);
    setViewMode("edit");
  };

  const openDetail = (b: Batch) => {
    setSelectedBatch(b);
    setViewMode("detail");
  };

  const openAdjust = (b: Batch) => {
    setAdjustBatch(b);
    setAdjustNewStock(b.currentStock);
    setAdjustReason("STOCK_CORRECTION");
    setAdjustDetails("");
    setAdjustModal(true);
  };

  const openHistory = async (b: Batch) => {
    setHistoryModal(true);
    setHistoryLoading(true);
    try {
      const data = await fetchBatchHistoryApi(b._id);
      setHistoryData(data);
    } catch {
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.productId || !form.batchNumber || !form.quantityProduced || !form.manufactureDate || !form.expiryDate) {
      showError(t("messages.errorMessage"), "Please fill all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      if (viewMode === "create") {
        await createBatchApi(form as any);
        showSuccess(t("messages.successMessage"), "Batch created successfully.");
      } else if (viewMode === "edit" && selectedBatch) {
        await updateBatchApi(selectedBatch._id, form as any);
        showSuccess(t("messages.successMessage"), "Batch updated successfully.");
      }
      setViewMode("list");
      loadBatches();
    } catch (e: any) {
      console.error("Batch save error:", e); showError(t("messages.errorMessage"), "Failed to save batch.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjust = async () => {
    if (!adjustBatch) return;
    setAdjusting(true);
    try {
      await adjustBatchStockApi(adjustBatch._id, {
        newStock: adjustNewStock,
        reason: adjustReason,
        reasonDetails: adjustDetails,
      });
      showSuccess(t("messages.successMessage"), "Stock adjusted successfully.");
      setAdjustModal(false);
      loadBatches();
      if (selectedBatch?._id === adjustBatch._id) {
        setSelectedBatch({ ...adjustBatch, currentStock: adjustNewStock });
      }
    } catch (e: any) {
      console.error("Stock adjust error:", e); showError(t("messages.errorMessage"), "Failed to adjust stock.");
    } finally {
      setAdjusting(false);
    }
  };

  if (loading && viewMode === "list") {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-emerald-50 text-emerald-700",
      OUT_OF_STOCK: "bg-rose-50 text-rose-700",
      HOLD: "bg-amber-50 text-amber-700",
      EXPIRED: "bg-gray-100 text-gray-500",
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${colors[status] || "bg-gray-100 text-gray-500"}`}>
        {status}
      </span>
    );
  };

  if (viewMode === "create" || viewMode === "edit") {
    const isEdit = viewMode === "edit";
    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-emerald-900">
            {isEdit ? "Edit Batch" : "Create Batch"}
          </h2>
          <Button variant="ghost" size="sm" onClick={() => setViewMode("list")}>
            Back to List
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Product *</label>
            <select
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              className="w-full p-2.5 border border-gray-150 rounded-xl text-xs bg-gray-50 cursor-pointer"
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {getTransValue(p.name, lang)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Batch Number *</label>
            <input
              type="text"
              value={form.batchNumber}
              onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
              className="w-full p-2.5 border border-gray-150 rounded-xl text-xs bg-gray-50"
              placeholder="e.g. BATCH-001"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Quantity Produced *</label>
            <input
              type="number"
              min={0}
              value={form.quantityProduced}
              onChange={(e) => setForm({ ...form, quantityProduced: Number(e.target.value) })}
              className="w-full p-2.5 border border-gray-150 rounded-xl text-xs bg-gray-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Batch["status"] })}
              className="w-full p-2.5 border border-gray-150 rounded-xl text-xs bg-gray-50 cursor-pointer"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="HOLD">HOLD</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Manufacture Date *</label>
            <input
              type="date"
              value={form.manufactureDate}
              onChange={(e) => setForm({ ...form, manufactureDate: e.target.value })}
              className="w-full p-2.5 border border-gray-150 rounded-xl text-xs bg-gray-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Expiry Date *</label>
            <input
              type="date"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              className="w-full p-2.5 border border-gray-150 rounded-xl text-xs bg-gray-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Prepared By</label>
            <input
              type="text"
              value={form.preparedBy}
              onChange={(e) => setForm({ ...form, preparedBy: e.target.value })}
              className="w-full p-2.5 border border-gray-150 rounded-xl text-xs bg-gray-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Supervised By</label>
            <input
              type="text"
              value={form.supervisedBy}
              onChange={(e) => setForm({ ...form, supervisedBy: e.target.value })}
              className="w-full p-2.5 border border-gray-150 rounded-xl text-xs bg-gray-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Approved By</label>
            <input
              type="text"
              value={form.approvedBy}
              onChange={(e) => setForm({ ...form, approvedBy: e.target.value })}
              className="w-full p-2.5 border border-gray-150 rounded-xl text-xs bg-gray-50"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={() => setViewMode("list")}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={submitting}>
            {isEdit ? "Update Batch" : "Create Batch"}
          </Button>
        </div>
      </div>
    );
  }

  if (viewMode === "detail" && selectedBatch) {
    const b = selectedBatch;
    const prodInfo = typeof b.productId === "object" ? b.productId : null;

    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-emerald-900">Batch Details</h2>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => openEdit(b)}>
              <Edit3 className="w-3.5 h-3.5 mr-1 inline" /> Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setViewMode("list")}>
              Back to List
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Product</p>
            <p className="text-sm font-semibold mt-0.5">{getProductName(prodInfo, lang)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Batch Number</p>
            <p className="text-sm font-mono font-bold mt-0.5">{b.batchNumber}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Current Stock</p>
            <p className="text-sm font-bold mt-0.5">{b.currentStock}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Quantity Produced</p>
            <p className="text-sm font-bold mt-0.5">{b.quantityProduced}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Manufacture Date</p>
            <p className="text-sm mt-0.5">{new Date(b.manufactureDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Expiry Date</p>
            <p className="text-sm mt-0.5">{new Date(b.expiryDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Status</p>
            <div className="mt-0.5">{statusBadge(b.status)}</div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Prepared By</p>
            <p className="text-sm mt-0.5">{b.preparedBy || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Supervised By</p>
            <p className="text-sm mt-0.5">{b.supervisedBy || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Approved By</p>
            <p className="text-sm mt-0.5">{b.approvedBy || "—"}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => openAdjust(b)}>
            <ArrowDownUp className="w-3.5 h-3.5 mr-1 inline" /> Stock Adjustment
          </Button>
          <Button variant="secondary" size="sm" onClick={() => openHistory(b)}>
            <History className="w-3.5 h-3.5 mr-1 inline" /> View History
          </Button>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3">Stock Adjustment History</h3>
          <HistoryTable batchId={b._id} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-bold font-display text-emerald-900">
          Batch Management ({batches.length})
        </h2>
        <Button onClick={openCreate} variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-1 inline" />
          Add Batch
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[1000px]">
          <thead>
            <tr className="border-b border-gray-200 text-gray-400 uppercase font-black tracking-widest text-[10px]">
              <th className="py-3 pr-4">Batch #</th>
              <th className="py-3 pr-4">Product</th>
              <th className="py-3 pr-4">Stock</th>
              <th className="py-3 pr-4">Produced</th>
              <th className="py-3 pr-4">Mfg Date</th>
              <th className="py-3 pr-4">Exp Date</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {batches.map((b) => {
              const prodInfo = typeof b.productId === "object" ? b.productId : null;
              return (
                <tr key={b._id} className="hover:bg-gray-50/50">
                  <td className="py-3 pr-4 font-mono font-bold text-siddha-dark text-xs">{b.batchNumber}</td>
                  <td className="py-3 pr-4 truncate max-w-[200px]">{getProductName(prodInfo, lang)}</td>
                  <td className="py-3 pr-4 font-mono text-sm font-bold">{b.currentStock}</td>
                  <td className="py-3 pr-4 text-gray-500">{b.quantityProduced}</td>
                  <td className="py-3 pr-4 text-gray-500 text-xs">{new Date(b.manufactureDate).toLocaleDateString()}</td>
                  <td className="py-3 pr-4 text-gray-500 text-xs">{new Date(b.expiryDate).toLocaleDateString()}</td>
                  <td className="py-3 pr-4">{statusBadge(b.status)}</td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openDetail(b)} className="p-1.5 text-gray-400 hover:text-siddha-dark cursor-pointer" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(b)} className="p-1.5 text-gray-400 hover:text-siddha-dark cursor-pointer" title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => openAdjust(b)} className="p-1.5 text-gray-400 hover:text-amber-600 cursor-pointer" title="Stock Adjustment">
                        <ArrowDownUp className="w-4 h-4" />
                      </button>
                      <button onClick={() => openHistory(b)} className="p-1.5 text-gray-400 hover:text-blue-600 cursor-pointer" title="History">
                        <History className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {batches.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400 text-sm">
                  No batches yet. Create your first batch.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stock Adjustment Modal */}
      <Modal isOpen={adjustModal} onClose={() => setAdjustModal(false)} title="Stock Adjustment" size="md">
        {adjustBatch && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1">
              <p><span className="font-bold">Batch:</span> {adjustBatch.batchNumber}</p>
              <p><span className="font-bold">Current Stock:</span> {adjustBatch.currentStock}</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">New Stock *</label>
              <input
                type="number"
                min={0}
                value={adjustNewStock}
                onChange={(e) => setAdjustNewStock(Number(e.target.value))}
                className="w-full p-2.5 border border-gray-150 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Reason *</label>
              <select
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full p-2.5 border border-gray-150 rounded-xl text-xs bg-white cursor-pointer"
              >
                <option value="STOCK_CORRECTION">Stock Correction</option>
                <option value="OFFLINE_SALES">Offline Sales</option>
                <option value="EXPIRED">Expired</option>
                <option value="DAMAGED">Damaged</option>
                <option value="SAMPLE">Sample</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Reason Details (optional)</label>
              <textarea
                value={adjustDetails}
                onChange={(e) => setAdjustDetails(e.target.value)}
                className="w-full p-2.5 border border-gray-150 rounded-xl text-xs resize-none"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setAdjustModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleAdjust} loading={adjusting}>Save Adjustment</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* History Modal */}
      <Modal isOpen={historyModal} onClose={() => setHistoryModal(false)} title="Stock Adjustment History" size="lg">
        {historyLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : historyData.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No adjustment history found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 uppercase font-bold tracking-widest text-[9px]">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Previous</th>
                  <th className="py-2 pr-3">New</th>
                  <th className="py-2 pr-3">Difference</th>
                  <th className="py-2 pr-3">Reason</th>
                  <th className="py-2 pr-3">Updated By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {historyData.map((h) => (
                  <tr key={h._id}>
                    <td className="py-2 pr-3 text-gray-500">{new Date(h.createdAt).toLocaleString()}</td>
                    <td className="py-2 pr-3 font-mono">{h.previousStock}</td>
                    <td className="py-2 pr-3 font-mono font-bold">{h.newStock}</td>
                    <td className="py-2 pr-3 font-mono">
                      <span className={h.difference >= 0 ? "text-emerald-600" : "text-rose-600"}>
                        {h.difference > 0 ? "+" : ""}{h.difference}
                      </span>
                    </td>
                    <td className="py-2 pr-3">{h.reason.replace(/_/g, " ")}</td>
                    <td className="py-2 pr-3">{h.updatedBy || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}

function HistoryTable({ batchId }: { batchId: string }) {
  const [data, setData] = useState<StockAdjustment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatchHistoryApi(batchId)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [batchId]);

  if (loading) return <Spinner size="sm" />;
  if (data.length === 0) return <p className="text-xs text-gray-400">No history yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-left">
        <thead>
          <tr className="border-b border-gray-200 text-gray-400 uppercase font-bold tracking-widest text-[9px]">
            <th className="py-2 pr-3">Date</th>
            <th className="py-2 pr-3">Previous</th>
            <th className="py-2 pr-3">New</th>
            <th className="py-2 pr-3">Diff</th>
            <th className="py-2 pr-3">Reason</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((h) => (
            <tr key={h._id}>
              <td className="py-2 pr-3 text-gray-500">{new Date(h.createdAt).toLocaleDateString()}</td>
              <td className="py-2 pr-3 font-mono">{h.previousStock}</td>
              <td className="py-2 pr-3 font-mono font-bold">{h.newStock}</td>
              <td className="py-2 pr-3 font-mono">
                <span className={h.difference >= 0 ? "text-emerald-600" : "text-rose-600"}>
                  {h.difference > 0 ? "+" : ""}{h.difference}
                </span>
              </td>
              <td className="py-2 pr-3">{h.reason.replace(/_/g, " ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
