import { useTranslation } from "react-i18next";

interface PaymentSelectorProps {
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
}

const paymentMethodsList = [
  { id: "UPI", title: "UPI (GPay / PhonePe / Paytm)", icon: "⚡" },
  { id: "Credit Card", title: "Credit Card / Net Banking", icon: "💳" },
  { id: "Debit Card", title: "Debit Card Solutions", icon: "🌐" },
  { id: "Net Banking", title: "Bank Netbanking Transfer", icon: "🏦" },
  { id: "Cash on Delivery", title: "Cash on Delivery (COD)", icon: "🚚" },
];

export default function PaymentSelector({ paymentMethod, setPaymentMethod }: PaymentSelectorProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
      <h3 className="text-base font-bold font-display text-emerald-950">{t('checkout.paymentMethod')}</h3>
      <p className="text-xs text-gray-400 block pb-1">{t('checkout.paymentSubtext')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {paymentMethodsList.map((payOpt) => {
          const isSelected = paymentMethod === payOpt.id;
          return (
            <button
              key={payOpt.id} type="button"
              onClick={() => setPaymentMethod(payOpt.id)}
              className={`p-4 border text-left rounded-2xl flex items-center justify-between cursor-pointer group transition-all duration-150 ${isSelected
                  ? "border-siddha-dark bg-emerald-50/50"
                  : "border-gray-150 hover:bg-slate-50"
                }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{payOpt.icon}</span>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">{payOpt.title}</h4>
                  <p className="text-[9px] text-gray-400 uppercase font-semibold mt-0.5">
                    {payOpt.id === "Cash on Delivery" ? t('checkout.codDesc') : t('checkout.securedDesc')}
                  </p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? "border-siddha-dark bg-siddha-dark text-white" : "border-gray-300"}`}>
                {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
