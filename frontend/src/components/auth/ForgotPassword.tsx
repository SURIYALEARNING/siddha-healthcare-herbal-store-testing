import { useTranslation } from "react-i18next";

interface ForgotPasswordProps {
  email: string;
  onEmailChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export default function ForgotPassword({ email, onEmailChange, onSubmit, onBack }: ForgotPasswordProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <h3 className="text-lg font-bold text-emerald-900 leading-none">{t("auth.resetPassword")}</h3>
        <p className="text-xs text-gray-400">{t("auth.forgotPasswordInstructions")}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">{t("auth.email")}</label>
          <input
            type="email"
            placeholder="suriyashankara@gmail.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-150 rounded-xl text-xs"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-siddha-dark text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          {t("auth.resetPassword")}
        </button>

        <button
          onClick={onBack}
          className="w-full text-xs text-gray-400 hover:text-gray-750 block text-center cursor-pointer"
          type="button"
        >
          {t("auth.backToAuth")}
        </button>
      </form>
    </div>
  );
}
