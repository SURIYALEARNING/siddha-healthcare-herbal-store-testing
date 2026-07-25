import { useTranslation } from "react-i18next";

export default function QuickCredentials() {
  const { t } = useTranslation();
  return (
    <div className="border-t border-gray-100 pt-4 space-y-2 font-mono text-[10px] text-gray-400 select-none bg-slate-50 p-3.5 rounded-2xl border-dashed">
      <p className="font-bold text-gray-700">{t("auth.quickCredentials")}</p>
      <p>{t("auth.adminAccess")}: admin@siddha.com / Password123</p>
      <p>{t("auth.customerAccess")}: ram@example.com / User123!</p>
    </div>
  );
}
