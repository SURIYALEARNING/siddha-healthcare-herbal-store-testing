import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { CheckCircle2 } from "lucide-react";
import { sendOtpApi, verifyOtpApi } from "../api";
import { useTranslation } from "react-i18next";
import AuthLayout from "../components/auth/AuthLayout";
import TabSwitcher from "../components/auth/TabSwitcher";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import OtpScreen from "../components/auth/OtpScreen";
import ForgotPassword from "../components/auth/ForgotPassword";
import GoogleLoginButton from "../components/auth/GoogleLoginButton";


export default function Auth() {
  const { t } = useTranslation();
  const { loginUser, googleAuth, updateUserProfile, error } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [googleMobile, setGoogleMobile] = useState("");
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<{ user: any; accessToken: string } | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const userParam = searchParams.get("user");
    if (accessToken && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        googleAuth(accessToken, userData);
        if (!userData.mobileNumber) {
          setGoogleUserData({ user: userData, accessToken });
        } else {
          navigate(userData.isAdmin || userData.role === "STAFF" || userData.role === "SUPER_ADMIN" ? "/admin" : "/account", { replace: true });
        }
      } catch (e) {
        console.error("Google auth failed:", e);
      }
    }
  }, [searchParams, googleAuth, navigate]);

  const handleGoogleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[0-9]{10}$/.test(googleMobile)) return;
    if (!googleUserData) return;
    setGoogleSubmitting(true);
    const ok = await updateUserProfile(googleUserData.user.fullName, googleMobile, {
      address: "", state: "", district: "", pincode: "",
    });
    setGoogleSubmitting(false);
    if (ok) {
      const u = googleUserData.user;
      navigate(u.isAdmin || u.role === "STAFF" || u.role === "SUPER_ADMIN" ? "/admin" : "/account", { replace: true });
    }
  };

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await loginUser(email, password);
    setLoading(false);
    if (ok) {
      setSuccess(t("auth.loginSuccess"));
      setTimeout(() => {
        const userObj = JSON.parse(localStorage.getItem("siddha_user") || "{}");
        navigate(userObj.isAdmin || userObj.role === "STAFF" || userObj.role === "SUPER_ADMIN" ? "/admin" : "/account");
      }, 1500);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !mobileNumber || !password) {
      alert(t("messages.fillAllFields"));
      return;
    }
    setLoading(true);
    try {
      await sendOtpApi(fullName, email, mobileNumber, password);
      setShowOtp(true);
      setSuccess(t("auth.otpSent"));
    } catch {
      alert(t("messages.registrationFailed"));
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtpApi(email, otpCode);
      setShowOtp(false);
      setSuccess(t("auth.registrationSuccess"));
      setTimeout(() => navigate("/account"), 1500);
    } catch {
      alert(t("messages.invalidOtp"));
    }
    setLoading(false);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t("messages.passwordRecoverySent", { email }));
    setShowForgot(false);
  };

  return (
    <AuthLayout>
      {googleUserData ? (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold font-display text-emerald-950">{t("auth.completeProfile")}</h2>
            <p className="text-xs text-gray-400">{t("auth.welcomeMessage", { name: googleUserData.user.fullName })}</p>
          </div>
          <form onSubmit={handleGoogleMobileSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">{t("auth.phone")}</label>
              <input
                type="text" placeholder={t("auth.phonePlaceholder")} value={googleMobile}
                onChange={(e) => setGoogleMobile(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-800 font-medium font-mono"
                required
              />
            </div>
            {error && (
              <p className="p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs font-bold">{error}</p>
            )}
            <button
              type="submit" disabled={googleSubmitting || !/^[0-9]{10}$/.test(googleMobile)}
              className="w-full py-3 bg-siddha-dark hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {googleSubmitting ? t("auth.saving") : t("auth.saveAndContinue")}
            </button>
          </form>
        </div>
      ) : showOtp ? (
        <OtpScreen
          email={email}
          otpCode={otpCode}
          loading={loading}
          onOtpChange={setOtpCode}
          onSubmit={handleVerifyOtp}
          onCancel={() => setShowOtp(false)}
        />
      ) : showForgot ? (
        <ForgotPassword
          email={email}
          onEmailChange={setEmail}
          onSubmit={handleForgotPassword}
          onBack={() => setShowForgot(false)}
        />
      ) : (
        <div className="space-y-6">
          <TabSwitcher active={activeTab} onChange={setActiveTab} />

          {error && (
            <p className="p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs font-bold">
              {error}
            </p>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {activeTab === "login" ? (
            <LoginForm
              email={email}
              password={password}
              loading={loading}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onSubmit={handleLogin}
              onForgotPassword={() => setShowForgot(true)}
            />
          ) : (
            <RegisterForm
              fullName={fullName}
              email={email}
              mobileNumber={mobileNumber}
              password={password}
              loading={loading}
              onFullNameChange={setFullName}
              onEmailChange={setEmail}
              onMobileChange={setMobileNumber}
              onPasswordChange={setPassword}
              onSubmit={handleRegister}
            />
          )}

          {activeTab === "login" && (
            <>
              <GoogleLoginButton />
            
            </>
          )}
        </div>
      )}
    </AuthLayout>
  );
}
