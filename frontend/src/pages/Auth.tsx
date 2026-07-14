import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ShieldCheck, Mail, Lock, User, Phone, CheckCircle2, ArrowRight } from "lucide-react";

export default function Auth() {
  const { loginUser, registerUser, error } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Common Form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  // OTP Verification state simulator
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpSentEmail, setotpSentEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  // Forgot Password flow
  const [forgotPasswordState, setForgotPasswordState] = useState(false);

  const googleLogin = () => {
    // Directly changes window location to the backend auth trigger route
    window.location.href = "http://localhost:5000/auth/google";
  };


  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (activeTab === "login") {
      const authorized = await loginUser(email, password);
      setLoading(false);
      if (authorized) {
        setSuccess("Login Successful! Restoring biological states...");
        setTimeout(() => {
          const userObj = JSON.parse(localStorage.getItem("siddha_user") || "{}");
          if (userObj.isAdmin) navigate("/admin");
          else navigate("/account");
        }, 1500);
      }
    } else {
      if (!fullName || !email || !mobileNumber || !password) {
        alert("Please fill out all required fields");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, mobileNumber, password })
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok) {
          setotpSentEmail(otpSentEmail); // Stays for reference UI
          setShowOtpScreen(true);
          setSuccess("OTP sent to your email!");
        } else {
          alert(data.message || "Registration initialization failed.");
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, otp: otpCode })
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setOtpVerified(true);
        setShowOtpScreen(false);
        setSuccess("Registration and OTP Verification Successful!");

        // Optional: You can auto-login user here if backend provides tokens
        setTimeout(() => {
          navigate("/account");
        }, 1500);
      } else {
        alert(data.message || "Invalid OTP");
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">

      {/* Box brand logotype */}
      <div className="text-center space-y-2 select-none">
        <div className="w-12 h-12 rounded-xl bg-siddha-dark flex items-center justify-center mx-auto shadow-md">
          <ShieldCheck className="w-7 h-7 text-siddha-light" />
        </div>
        <h2 className="text-2xl font-black font-display text-emerald-900 leading-none">Ayush Siddha Gateway</h2>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Safe Traditional Authentication</span>
      </div>

      <div className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 shadow-xs">

        {/* OTP SCREEN */}
        {showOtpScreen ? (
          <form onSubmit={handleOtpVerification} className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-full uppercase tracking-wider w-fit mx-auto">
                ⭐ Dynamic OTP Verification Guard
              </p>
              <h3 className="text-xl font-bold text-gray-800">Enter OTP Code</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                We sent a simulated 6-digit verification code to your Email <span className="font-bold text-gray-800">{otpSentEmail}</span>.
              </p>
              {/* <p className="text-[11px] text-amber-600 font-black">Specify standard default OTP: '1234' to verify</p> */}
            </div>

            <div className="space-y-1 text-center">
              <input
                type="text"
                placeholder="Ex. 123456"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-32 text-center tracking-widest text-2xl px-3 py-2 bg-gray-50 border-2 border-slate-200 focus:border-siddha-dark rounded-xl focus:outline-none font-black text-gray-800"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-siddha-dark hover:bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Verify OTP Mobile Code
            </button>

            <button
              onClick={() => setShowOtpScreen(false)}
              className="w-full text-xs text-gray-400 hover:text-gray-700 font-medium cursor-pointer"
              type="button"
            >
              Cancel Registration
            </button>
          </form>
        ) : forgotPasswordState ? (

          /* FORGOT PASSWORD SCREEN */
          <div className="space-y-6">
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-emerald-900 leading-none">Password recovery</h3>
              <p className="text-xs text-gray-400">Specify register email to receive recovery instructions</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(`Password recovery instructions has been prioritized. Password guidelines sent to ${email}`);
                setForgotPasswordState(false);
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Registered Email</label>
                <input
                  type="email"
                  placeholder="suriyashankara@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-150 rounded-xl text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-siddha-dark text-white rounded-xl text-xs font-bold"
              >
                Dispatch Reset Email
              </button>

              <button
                onClick={() => setForgotPasswordState(false)}
                className="w-full text-xs text-gray-400 hover:text-gray-750 block text-center"
                type="button"
              >
                Back to Authentication Panel
              </button>
            </form>
          </div>

        ) : (

          /* MAIN AUTH SIGNUP/SIGNIN WRAPPER */
          <div className="space-y-6">

            {/* Tab trigger headers */}
            <div className="grid grid-cols-2 border-b border-gray-100 pb-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className={`py-2 text-xs font-black uppercase tracking-widest cursor-pointer ${activeTab === "login"
                  ? "text-siddha-dark border-b-2 border-siddha-dark pb-3.5"
                  : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className={`py-2 text-xs font-black uppercase tracking-widest cursor-pointer ${activeTab === "register"
                  ? "text-siddha-dark border-b-2 border-siddha-dark pb-3.5"
                  : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                Register
              </button>
            </div>

            {error && (
              <p className="p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs font-bold leading-normal">
                {error}
              </p>
            )}

            {success && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Auth forms */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">

              {activeTab === "register" && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Full Name *</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ex. Suriyashankara Bose"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark text-xs rounded-xl focus:bg-white text-gray-700"
                        required
                      />
                      <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Contact Mobile Number *</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ex. 9876543210"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark text-xs rounded-xl focus:bg-white text-gray-700 font-mono"
                        required
                      />
                      <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Email Address *</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="suriyashankara@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark text-xs rounded-xl focus:bg-white text-gray-750"
                    required
                  />
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Password *</label>
                  {activeTab === "login" && (
                    <button
                      type="button"
                      onClick={() => setForgotPasswordState(true)}
                      className="text-[10px] text-gray-400 hover:text-gray-600 underline font-semibold"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                <span>{activeTab === "login" ? "Authorize Sign In" : "Request OTP Code"}</span>
                <ArrowRight className="w-4 h-4 text-siddha-gold" />
              </button>

            </form>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
              <button
                onClick={googleLogin}
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  backgroundColor: '#4285F4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Sign in with Google
              </button>
            </div>
            {/* Quick Login Helper credentials list */}
            <div className="border-t border-gray-100 pt-4 space-y-2 font-mono text-[10px] text-gray-400 select-none bg-slate-50 p-3.5 rounded-2xl border-dashed">
              <p className="font-bold text-gray-700">Quick Credentials:</p>
              <p>• <span className="font-semibold text-emerald-800">Admin access</span>: admin@siddha.com / Password123</p>
              <p>• <span className="font-semibold text-emerald-800">Customer access</span>: ram@example.com / User123!</p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
