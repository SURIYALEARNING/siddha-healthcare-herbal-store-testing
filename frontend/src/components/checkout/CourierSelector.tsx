import { useTranslation } from "react-i18next";
import { Truck, CheckCircle } from "lucide-react";
import type { ShippingOption } from "../../types";

interface CourierSelectorProps {
  options: ShippingOption[];
  selectedCourierId: string;
  onSelect: (courierId: string) => void;
  packedWeight: number;
  loading: boolean;
}

export default function CourierSelector({ options, selectedCourierId, onSelect, packedWeight, loading }: CourierSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold font-display text-emerald-950 flex items-center">
          <Truck className="w-4.5 h-4.5 text-siddha-dark mr-1.5" />
          {t('checkout.shippingMethod') || 'Shipping Method'}
        </h3>
        {packedWeight > 0 && (
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {t('checkout.packedWeight') || 'Packed Weight'}: <span className="text-siddha-dark font-black">{packedWeight}g</span>
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : options.length === 0 ? (
        <div className="text-center py-8 space-y-2">
          <Truck className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm font-bold text-emerald-950">{t('checkout.noShippingMethods') || 'No shipping methods available for this address'}</p>
          <p className="text-xs text-gray-400">{t('checkout.noShippingMethodsHint') || 'Please verify your pincode or contact support.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {options.map((option) => {
            const selected = selectedCourierId === option.courierId;
            return (
              <button
                key={option.courierId}
                type="button"
                onClick={() => onSelect(option.courierId)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  selected
                    ? "border-siddha-dark bg-emerald-50/60 ring-1 ring-siddha-dark/20"
                    : "border-gray-100 hover:border-emerald-200 hover:bg-gray-50/50"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  selected ? "border-siddha-dark bg-siddha-dark text-white" : "border-gray-300 bg-white"
                }`}>
                  {selected && <CheckCircle className="w-3 h-3" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-gray-800">{option.courierName}</span>
                    {option.isDefault && (
                      <span className="text-[9px] font-black uppercase bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                        {t('checkout.defaultCourier') || 'Default'}
                      </span>
                    )}
                    {option.zoneName && (
                      <span className="text-[9px] font-bold text-gray-400 uppercase">via {option.zoneName}</span>
                    )}
                  </div>
                  {option.description && (
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">{option.description}</p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  {option.charge === 0 ? (
                    <span className="text-emerald-700 font-black text-sm">{t('cart.free')}</span>
                  ) : (
                    <span className="text-sm font-black text-siddha-dark font-mono">₹{option.charge}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
