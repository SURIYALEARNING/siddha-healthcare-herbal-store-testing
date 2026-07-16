import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { CheckCircle2 } from "lucide-react";
import { sendOtpApi, verifyOtpApi } from "../api";
import AuthLayout from "../components/auth/AuthLayout";
import TabSwitcher from "../components/auth/TabSwitcher";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import OtpScreen from "../components/auth/OtpScreen";
import ForgotPassword from "../components/auth/ForgotPassword";
import GoogleLoginButton from "../components/auth/GoogleLoginButton";
import QuickCredentials from "../components/auth/QuickCredentials";

export default function Auth() {
  const { loginUser, error } = useApp();
  const navigate = useNavigate();

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
      setSuccess("Login Successful! Restoring biological states...");
      setTimeout(() => {
        const userObj = JSON.parse(localStorage.getItem("siddha_user") || "{}");
        navigate(userObj.isAdmin ? "/admin" : "/account");
      }, 1500);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !mobileNumber || !password) {
      alert("Please fill out all required fields");
      return;
    }
    setLoading(true);
    try {
      await sendOtpApi(fullName, email, mobileNumber, password);
      setShowOtp(true);
      setSuccess("OTP sent to your email!");
    } catch {
      alert("Registration initialization failed.");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtpApi(email, otpCode);
      setShowOtp(false);
      setSuccess("Registration and OTP Verification Successful!");
      setTimeout(() => navigate("/account"), 1500);
    } catch {
      alert("Invalid OTP");
    }
    setLoading(false);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Password recovery instructions sent to ${email}`);
    setShowForgot(false);
  };

  return (
    <AuthLayout>
      {showOtp ? (
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
              <QuickCredentials />
            </>
          )}
        </div>
      )}
    </AuthLayout>
  );
}
