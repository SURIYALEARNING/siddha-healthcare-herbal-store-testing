import { useTranslation } from "react-i18next";
import { User, Phone, Mail, Lock, ArrowRight } from "lucide-react";

interface RegisterFormProps {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  loading: boolean;
  onFullNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onMobileChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function RegisterForm({
  fullName, email, mobileNumber, password, loading,
  onFullNameChange, onEmailChange, onMobileChange, onPasswordChange, onSubmit,
}: RegisterFormProps) {
  const { t } = useTranslation();
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase">{t("auth.name")}</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Ex. Suriyashankara Bose"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark text-xs rounded-xl focus:bg-white text-gray-700"
            required
          />
          <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase">{t("auth.phone")}</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Ex. 9876543210"
            value={mobileNumber}
            onChange={(e) => onMobileChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark text-xs rounded-xl focus:bg-white text-gray-700 font-mono"
            required
          />
          <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase">{t("auth.email")}</label>
        <div className="relative">
          <input
            type="email"
            placeholder="suriyashankara@gmail.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark text-xs rounded-xl focus:bg-white text-gray-750"
            required
          />
          <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase">{t("auth.password")}</label>
        <div className="relative">
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark text-xs rounded-xl focus:bg-white text-gray-750 font-mono"
            required
          />
          <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3.5 bg-siddha-dark hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1 shadow-sm mt-3"
        disabled={loading}
      >
        <span>{t("auth.register")}</span>
        <ArrowRight className="w-4 h-4 text-siddha-gold" />
      </button>
    </form>
  );
}
