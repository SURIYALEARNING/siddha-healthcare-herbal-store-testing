import { useTranslation } from "react-i18next";

interface OtpScreenProps {
  email: string;
  otpCode: string;
  loading: boolean;
  onOtpChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function OtpScreen({ email, otpCode, loading, onOtpChange, onSubmit, onCancel }: OtpScreenProps) {
  const { t } = useTranslation();
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-full uppercase tracking-wider w-fit mx-auto">
          {t("otp.guardLabel")}
        </p>
        <h3 className="text-xl font-bold text-gray-800">{t("otp.enterCode")}</h3>
        <p className="text-xs text-gray-500 max-w-xs mx-auto">
          {t("otp.sentToEmail")}{" "}
          <span className="font-bold text-gray-800">{email}</span>.
        </p>
      </div>

      <div className="space-y-1 text-center">
        <input
          type="text"
          placeholder={t("otp.placeholder")}
          maxLength={6}
          value={otpCode}
          onChange={(e) => onOtpChange(e.target.value)}
          className="w-32 text-center tracking-widest text-2xl px-3 py-2 bg-gray-50 border-2 border-slate-200 focus:border-siddha-dark rounded-xl focus:outline-none font-black text-gray-800"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full py-3.5 bg-siddha-dark hover:bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer"
        disabled={loading}
      >
        {t("otp.verify")}
      </button>

      <button
        onClick={onCancel}
        className="w-full text-xs text-gray-400 hover:text-gray-700 font-medium cursor-pointer"
        type="button"
      >
        {t("otp.cancel")}
      </button>
    </form>
  );
}
