import { useTranslation } from 'react-i18next';
import { ShieldCheck } from "lucide-react";

export function VerifiedPurchaseBadge() {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
      <ShieldCheck className="w-3 h-3" />
      {t('productDetails.verifiedPurchase')}
    </span>
  );
}
