import { useState } from "react";
import { Building2, MapPinned, IndianRupee } from "lucide-react";
import CourierCompaniesPanel from "./CourierCompaniesPanel";
import CourierZonesPanel from "./CourierZonesPanel";
import CourierRatesPanel from "./CourierRatesPanel";

type Panel = "couriers" | "zones" | "rates";

const PANELS: { id: Panel; label: string; Icon: typeof Building2 }[] = [
  { id: "couriers", label: "Courier Companies", Icon: Building2 },
  { id: "zones", label: "Zones", Icon: MapPinned },
  { id: "rates", label: "Rate Tables", Icon: IndianRupee },
];

export default function ShippingManagementTab() {
  const [panel, setPanel] = useState<Panel>("couriers");
  const [selectedCourierId, setSelectedCourierId] = useState<string>("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold font-display text-emerald-900">Shipping Management</h2>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
            Couriers · Zones · Rate Tables
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-0.5">
          {PANELS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setPanel(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-colors ${
                panel === id ? "bg-white text-siddha-dark shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {panel === "couriers" && (
        <CourierCompaniesPanel onSelectCourier={setSelectedCourierId} />
      )}
      {panel === "zones" && (
        <CourierZonesPanel selectedCourierId={selectedCourierId} onCourierChange={setSelectedCourierId} />
      )}
      {panel === "rates" && (
        <CourierRatesPanel selectedCourierId={selectedCourierId} onCourierChange={setSelectedCourierId} />
      )}
    </div>
  );
}
