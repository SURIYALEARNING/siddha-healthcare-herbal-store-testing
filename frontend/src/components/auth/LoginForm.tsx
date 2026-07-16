import { Mail, Lock, ArrowRight } from "lucide-react";

interface LoginFormProps {
  email: string;
  password: string;
  loading: boolean;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
}

export default function LoginForm({
  email, password, loading,
  onEmailChange, onPasswordChange, onSubmit, onForgotPassword,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase">Email Address *</label>
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
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Password *</label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-[10px] text-gray-400 hover:text-gray-600 underline font-semibold"
          >
            Forgot password?
          </button>
        </div>
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
        <span>Authorize Sign In</span>
        <ArrowRight className="w-4 h-4 text-siddha-gold" />
      </button>
    </form>
  );
}
