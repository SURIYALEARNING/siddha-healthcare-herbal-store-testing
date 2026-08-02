import { useCallback, useEffect, useState } from "react";
import { Plus, Edit3, Trash2, Star, StarOff, Power, Building2 } from "lucide-react";
import { useToastContext } from "../../context/ToastContext";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import {
  fetchCouriersApi,
  createCourierApi,
  updateCourierApi,
  deleteCourierApi,
} from "../../api/shipping";
import type { Courier } from "../../types";

interface CourierFormState {
  name: string;
  logo: string;
  description: string;
  trackingUrl: string;
  isActive: boolean;
  isDefault: boolean;
}

const EMPTY_FORM: CourierFormState = { name: "", logo: "", description: "", trackingUrl: "", isActive: true, isDefault: false };

interface CourierCompaniesPanelProps {
  onSelectCourier: (id: string) => void;
}

export default function CourierCompaniesPanel({ onSelectCourier }: CourierCompaniesPanelProps) {
  const { showSuccess, showError } = useToastContext();
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CourierFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCouriers(await fetchCouriersApi());
    } catch {
      showError("Failed to load", "Could not fetch courier companies.");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (c: Courier) => {
    setEditingId(c._id);
    setForm({ name: c.name, logo: c.logo, description: c.description, trackingUrl: c.trackingUrl || "", isActive: c.isActive, isDefault: c.isDefault });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showError("Required", "Company name is required.");
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await updateCourierApi(editingId, form);
        showSuccess("Updated", "Courier company updated.");
      } else {
        await createCourierApi(form);
        showSuccess("Created", "Courier company created.");
      }
      setModalOpen(false);
      await load();
    } catch (err: any) {
      showError("Failed", err?.response?.data?.error || err?.message || "Could not save courier company.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c: Courier) => {
    if (!window.confirm(`Delete courier "${c.name}" and all of its zones & rates?`)) return;
    try {
      await deleteCourierApi(c._id);
      showSuccess("Deleted", "Courier company deleted.");
      await load();
    } catch {
      showError("Failed", "Could not delete courier company.");
    }
  };

  const toggleActive = async (c: Courier) => {
    try {
      await updateCourierApi(c._id, { isActive: !c.isActive });
      showSuccess("Updated", `${c.name} is now ${c.isActive ? "disabled" : "enabled"}.`);
      await load();
    } catch {
      showError("Failed", "Could not update courier status.");
    }
  };

  const setDefault = async (c: Courier) => {
    try {
      await updateCourierApi(c._id, { isDefault: true });
      showSuccess("Default", `${c.name} is now the default courier.`);
      await load();
    } catch {
      showError("Failed", "Could not set default courier.");
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-sm font-bold font-display text-emerald-950">Courier Companies</h3>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
              Only one courier can be the default
            </p>
          </div>
          <Button onClick={openAdd} variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1 inline" />
            Add Courier
          </Button>
        </div>

        {couriers.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-bold text-emerald-950">No courier companies yet</p>
            <p className="text-xs text-gray-400">Add couriers like Professional Couriers, ST Courier, DTDC, Blue Dart...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {couriers.map((c) => (
              <div key={c._id} className={`rounded-2xl border p-5 space-y-3 transition-all ${
                c.isDefault ? "border-emerald-300 bg-emerald-50/40" : "border-gray-100 bg-white"
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {c.logo ? (
                      <img src={c.logo} alt={c.name} className="w-10 h-10 rounded-xl object-contain border border-gray-100 bg-white" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-siddha-dark/5 flex items-center justify-center text-siddha-dark font-black text-sm">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-gray-800 truncate flex items-center gap-1.5">
                        {c.name}
                        {c.isDefault && (
                          <span className="text-[9px] font-black uppercase bg-emerald-600 text-white px-1.5 py-0.5 rounded">Default</span>
                        )}
                      </h4>
                      <p className="text-[10px] text-gray-400">{c.isActive ? "Active" : "Disabled"}</p>
                    </div>
                  </div>
                </div>

                {c.description && (
                  <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">{c.description}</p>
                )}

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => setDefault(c)}
                    disabled={c.isDefault}
                    title={c.isDefault ? "Already default" : "Set as default courier"}
                    className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-bold px-2 py-1.5 rounded-lg border cursor-pointer transition-colors disabled:opacity-40 ${
                      c.isDefault ? "bg-emerald-600 text-white border-emerald-600" : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-amber-50 hover:text-amber-600"
                    }`}
                  >
                    {c.isDefault ? <Star className="w-3 h-3" /> : <StarOff className="w-3 h-3" />}
                    {c.isDefault ? "Default" : "Set Default"}
                  </button>
                  <button
                    onClick={() => toggleActive(c)}
                    title={c.isActive ? "Disable" : "Enable"}
                    className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                      c.isActive ? "text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100" : "text-gray-400 bg-gray-50 border-gray-100 hover:bg-gray-100"
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { onSelectCourier(c._id); openEdit(c); }}
                    title="Edit"
                    className="p-1.5 text-gray-400 hover:text-siddha-dark rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    title="Delete"
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Courier Company" : "Add Courier Company"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Company Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex. Professional Couriers"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:outline-none focus:border-siddha-dark focus:bg-white"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Logo URL (optional)</label>
            <input
              type="url"
              value={form.logo}
              onChange={(e) => setForm({ ...form, logo: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:outline-none focus:border-siddha-dark focus:bg-white font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Optional description"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:outline-none focus:border-siddha-dark focus:bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Tracking URL</label>
            <input
              type="url"
              value={form.trackingUrl}
              onChange={(e) => setForm({ ...form, trackingUrl: e.target.value })}
              placeholder="https://tracking.example.com/track/ (optional)"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:outline-none focus:border-siddha-dark focus:bg-white font-mono"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-siddha-dark focus:ring-siddha-dark/20 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-siddha-dark focus:ring-siddha-dark/20 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">Set as default courier</span>
            </label>
          </div>
          <Button type="submit" variant="primary" className="w-full" loading={submitting}>
            {editingId ? "Save Changes" : "Create Courier"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
