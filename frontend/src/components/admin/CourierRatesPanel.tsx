import { useCallback, useEffect, useState } from "react";
import { Save, IndianRupee } from "lucide-react";
import { useToastContext } from "../../context/ToastContext";
import { Button } from "../ui/Button";
import {
  fetchCouriersApi,
  fetchZonesApi,
  fetchRatesApi,
  saveRateApi,
} from "../../api/shipping";
import type { Courier, CourierZone, CourierRate } from "../../types";

interface CourierRatesPanelProps {
  selectedCourierId: string;
  onCourierChange: (id: string) => void;
}

function computeCharge(upTo500g: number, upTo1kg: number, additionalKg: number, weightGrams: number): number {
  if (weightGrams <= 0) return 0;
  if (weightGrams <= 500) return upTo500g;
  if (weightGrams <= 1000) return upTo1kg;
  const remaining = weightGrams - 1000;
  const extraUnits = Math.ceil(remaining / 1000);
  return upTo1kg + extraUnits * additionalKg;
}

const SAMPLE_WEIGHTS = [250, 500, 1000, 2500, 4000];

export default function CourierRatesPanel({ selectedCourierId, onCourierChange }: CourierRatesPanelProps) {
  const { showSuccess, showError } = useToastContext();
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [zones, setZones] = useState<CourierZone[]>([]);
  const [zoneId, setZoneId] = useState("");
  const [rate, setRate] = useState<CourierRate | null>(null);
  const [upTo500g, setUpTo500g] = useState("");
  const [upTo1kg, setUpTo1kg] = useState("");
  const [additionalKg, setAdditionalKg] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCouriersApi().then(setCouriers).catch(() => setCouriers([]));
  }, []);

  const loadZones = useCallback(async () => {
    if (!selectedCourierId) {
      setZones([]);
      setZoneId("");
      return;
    }
    try {
      setZones(await fetchZonesApi(selectedCourierId));
    } catch {
      setZones([]);
    }
  }, [selectedCourierId]);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  const loadRate = useCallback(async (zid: string) => {
    if (!zid) {
      setRate(null);
      setUpTo500g("");
      setUpTo1kg("");
      setAdditionalKg("");
      return;
    }
    setLoading(true);
    try {
      const rates = await fetchRatesApi(zid);
      const found = rates[0] || null;
      setRate(found);
      setUpTo500g(String(found?.upTo500g ?? ""));
      setUpTo1kg(String(found?.upTo1kg ?? ""));
      setAdditionalKg(String(found?.additionalKg ?? ""));
    } catch {
      setRate(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRate(zoneId);
  }, [zoneId, loadRate]);

  const handleSave = async () => {
    if (!zoneId) {
      showError("Required", "Please select a zone.");
      return;
    }
    setSaving(true);
    try {
      const saved = await saveRateApi({
        zoneId,
        upTo500g: Number(upTo500g) || 0,
        upTo1kg: Number(upTo1kg) || 0,
        additionalKg: Number(additionalKg) || 0,
      });
      setRate(saved);
      showSuccess("Saved", "Rate table updated.");
    } catch (err: any) {
      showError("Failed", err?.response?.data?.error || err?.message || "Could not save rate table.");
    } finally {
      setSaving(false);
    }
  };

  const n500 = Number(upTo500g) || 0;
  const n1kg = Number(upTo1kg) || 0;
  const nextra = Number(additionalKg) || 0;

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
      <div>
        <h3 className="text-sm font-bold font-display text-emerald-950">Courier Rate Tables</h3>
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
          Prices are in ₹ and can be edited from here
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Courier</label>
          <select
            value={selectedCourierId}
            onChange={(e) => onCourierChange(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold cursor-pointer focus:outline-none focus:border-siddha-dark"
          >
            <option value="">Select Courier</option>
            {couriers.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Zone</label>
          <select
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
            disabled={!selectedCourierId}
            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold cursor-pointer focus:outline-none focus:border-siddha-dark disabled:opacity-50"
          >
            <option value="">Select Zone</option>
            {zones.map((z) => (
              <option key={z._id} value={z._id}>{z.name}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedCourierId || !zoneId ? (
        <div className="text-center py-12 text-xs text-gray-400">
          Select a courier and zone to edit its rate table.
        </div>
      ) : loading ? (
        <div className="h-32 bg-gray-50 rounded-2xl animate-pulse" />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Up to 500g (₹)</label>
              <input
                type="number"
                min={0}
                value={upTo500g}
                onChange={(e) => setUpTo500g(e.target.value)}
                placeholder="Ex. 60"
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Up to 1kg (₹)</label>
              <input
                type="number"
                min={0}
                value={upTo1kg}
                onChange={(e) => setUpTo1kg(e.target.value)}
                placeholder="Ex. 90"
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Additional kg (₹)</label>
              <input
                type="number"
                min={0}
                value={additionalKg}
                onChange={(e) => setAdditionalKg(e.target.value)}
                placeholder="Ex. 90"
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Shipping preview</span>
            </div>
            <Button onClick={handleSave} variant="primary" size="sm" loading={saving}>
              <Save className="w-4 h-4 mr-1 inline" />
              Save Rate Table
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {SAMPLE_WEIGHTS.map((w) => (
              <div key={w} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-center">
                <p className="text-[9px] font-bold uppercase text-gray-400">
                  {w < 1000 ? `${w}g` : `${w / 1000}kg`}
                </p>
                <p className="text-sm font-black text-siddha-dark font-mono mt-1">
                  ₹{computeCharge(n500, n1kg, nextra, w)}
                </p>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-gray-400">
            Example (2.6kg): 1kg ₹{n1kg} + remaining {2600 - 1000}g → {Math.ceil((2600 - 1000) / 1000)} extra kg × ₹{nextra} = ₹{computeCharge(n500, n1kg, nextra, 2600)}
          </p>
        </>
      )}
    </div>
  );
}
