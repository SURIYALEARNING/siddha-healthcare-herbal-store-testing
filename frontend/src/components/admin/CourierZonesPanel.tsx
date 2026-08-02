import { useCallback, useEffect, useState } from "react";
import { Plus, Edit3, Trash2, MapPinned } from "lucide-react";
import { useToastContext } from "../../context/ToastContext";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import TagInput from "../ui/TagInput";
import {
  fetchCouriersApi,
  fetchZonesApi,
  createZoneApi,
  updateZoneApi,
  deleteZoneApi,
} from "../../api/shipping";
import { INDIAN_STATES } from "../../constants/indianStates";
import type { Courier, CourierZone } from "../../types";

interface ZoneFormState {
  name: string;
  states: string[];
  districts: string[];
  pincodes: string[];
  upTo500g: string;
  upTo1kg: string;
  additionalKg: string;
}

const EMPTY_FORM: ZoneFormState = {
  name: "",
  states: [],
  districts: [],
  pincodes: [],
  upTo500g: "",
  upTo1kg: "",
  additionalKg: "",
};

interface CourierZonesPanelProps {
  selectedCourierId: string;
  onCourierChange: (id: string) => void;
}

export default function CourierZonesPanel({ selectedCourierId, onCourierChange }: CourierZonesPanelProps) {
  const { showSuccess, showError } = useToastContext();
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [zones, setZones] = useState<CourierZone[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ZoneFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCouriersApi().then(setCouriers).catch(() => setCouriers([]));
  }, []);

  const loadZones = useCallback(async () => {
    if (!selectedCourierId) return;
    setLoading(true);
    try {
      setZones(await fetchZonesApi(selectedCourierId));
    } catch {
      setZones([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCourierId]);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (z: CourierZone) => {
    setEditingId(z._id);
    setForm({
      name: z.name,
      states: z.states || [],
      districts: z.districts || [],
      pincodes: z.pincodes || [],
      upTo500g: "",
      upTo1kg: "",
      additionalKg: "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourierId) {
      showError("Required", "Please select a courier first.");
      return;
    }
    if (!form.name.trim()) {
      showError("Required", "Zone name is required.");
      return;
    }

    const payload: any = {
      courierId: selectedCourierId,
      name: form.name.trim(),
      states: form.states,
      districts: form.districts,
      pincodes: form.pincodes,
    };

    const hasRates = form.upTo500g !== "" || form.upTo1kg !== "" || form.additionalKg !== "";
    if (hasRates) {
      payload.rate = {
        upTo500g: Number(form.upTo500g) || 0,
        upTo1kg: Number(form.upTo1kg) || 0,
        additionalKg: Number(form.additionalKg) || 0,
      };
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateZoneApi(editingId, payload);
        showSuccess("Updated", "Zone updated.");
      } else {
        await createZoneApi(payload);
        showSuccess("Created", "Zone created.");
      }
      setModalOpen(false);
      await loadZones();
    } catch (err: any) {
      showError("Failed", err?.response?.data?.error || err?.message || "Could not save zone.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (z: CourierZone) => {
    if (!window.confirm(`Delete zone "${z.name}" and its rate table?`)) return;
    try {
      await deleteZoneApi(z._id);
      showSuccess("Deleted", "Zone deleted.");
      await loadZones();
    } catch {
      showError("Failed", "Could not delete zone.");
    }
  };

  const addAllStates = () => {
    setForm((f) => ({ ...f, states: [...new Set([...f.states, ...INDIAN_STATES])] }));
  };

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-sm font-bold font-display text-emerald-950">Courier Zones</h3>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
              Each courier can have multiple zones with different prices
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedCourierId}
              onChange={(e) => onCourierChange(e.target.value)}
              className="p-2 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold cursor-pointer focus:outline-none focus:border-siddha-dark"
            >
              <option value="">Select Courier</option>
              {couriers.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <Button onClick={openAdd} variant="primary" size="sm" disabled={!selectedCourierId}>
              <Plus className="w-4 h-4 mr-1 inline" />
              Add Zone
            </Button>
          </div>
        </div>

        {!selectedCourierId ? (
          <div className="text-center py-12 text-xs text-gray-400">
            Select a courier to manage its zones.
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : zones.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <MapPinned className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-bold text-emerald-950">No zones for this courier</p>
            <p className="text-xs text-gray-400">Add zones like "Tamil Nadu", "Kerala", "North India"...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {zones.map((z) => (
              <div key={z._id} className="border border-gray-100 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{z.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {z.states.length} states · {z.districts.length} districts · {z.pincodes.length} pincodes
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(z)} className="p-1.5 text-gray-400 hover:text-siddha-dark rounded-lg hover:bg-gray-50 cursor-pointer" title="Edit">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(z)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {z.states.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {z.states.slice(0, 6).map((s) => (
                      <span key={s} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{s}</span>
                    ))}
                    {z.states.length > 6 && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-50 text-gray-500">+{z.states.length - 6}</span>
                    )}
                  </div>
                )}

                {z.districts.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {z.districts.slice(0, 4).map((d) => (
                      <span key={d} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{d}</span>
                    ))}
                    {z.districts.length > 4 && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-50 text-gray-500">+{z.districts.length - 4}</span>
                    )}
                  </div>
                )}

                {z.pincodes.length > 0 && (
                  <p className="text-[10px] text-gray-500 font-mono truncate">
                    Pincodes: {z.pincodes.slice(0, 8).join(", ")}
                    {z.pincodes.length > 8 ? ` +${z.pincodes.length - 8}` : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Zone" : "Add Zone"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Zone Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex. Tamil Nadu, Kerala, North India..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:outline-none focus:border-siddha-dark focus:bg-white"
              required
            />
          </div>

          <TagInput
            label="States"
            items={form.states}
            onItemsChange={(states) => setForm({ ...form, states })}
            placeholder="Type a state and press Enter"
          />
          <div className="-mt-1">
            <button
              type="button"
              onClick={addAllStates}
              className="text-[10px] font-bold text-siddha-dark hover:text-emerald-700 cursor-pointer underline underline-offset-2"
            >
              Add all Indian states
            </button>
          </div>

          <TagInput
            label="Districts (optional)"
            items={form.districts}
            onItemsChange={(districts) => setForm({ ...form, districts })}
            placeholder="Ex. Chennai, Coimbatore..."
          />

          <TagInput
            label="Pincodes (optional, supports ranges like 600001-600110)"
            items={form.pincodes}
            onItemsChange={(pincodes) => setForm({ ...form, pincodes })}
            placeholder="Ex. 600001 or 600001-600110"
          />

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Rate Table (₹) — optional, can set later</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Up to 500g</label>
                <input
                  type="number"
                  min={0}
                  value={form.upTo500g}
                  onChange={(e) => setForm({ ...form, upTo500g: e.target.value })}
                  placeholder="Ex. 60"
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Up to 1kg</label>
                <input
                  type="number"
                  min={0}
                  value={form.upTo1kg}
                  onChange={(e) => setForm({ ...form, upTo1kg: e.target.value })}
                  placeholder="Ex. 90"
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Additional kg</label>
                <input
                  type="number"
                  min={0}
                  value={form.additionalKg}
                  onChange={(e) => setForm({ ...form, additionalKg: e.target.value })}
                  placeholder="Ex. 90"
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white font-mono"
                />
              </div>
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full" loading={submitting}>
            {editingId ? "Save Changes" : "Create Zone"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
