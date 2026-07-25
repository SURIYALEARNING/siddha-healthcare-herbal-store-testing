import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation();
  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2 select-none">
        <div className="w-12 h-12 rounded-xl bg-siddha-dark flex items-center justify-center mx-auto shadow-md">
          <ShieldCheck className="w-7 h-7 text-siddha-light" />
        </div>
        <h2 className="text-2xl font-black font-display text-emerald-900 leading-none">{t("auth.gatewayTitle")}</h2>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{t("auth.gatewaySubtitle")}</span>
      </div>

      <div className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 shadow-xs">
        {children}
      </div>
    </div>
  );
}
