import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { ToastProvider, useToastContext } from "./context/ToastContext";
import ToastContainer from "./components/Toast/ToastContainer";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import SiddhaAIChatbot from "./components/SiddhaAIChatbot";
import { useTranslation } from "react-i18next";

// Pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import TrackOrder from "./pages/TrackOrder";
import Blogs from "./pages/Blogs";
import BlogDetails from "./pages/BlogDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import OrdersHistory from "./pages/OrdersHistory";


// Modal component for doctor appointments
function ConsultationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { submitConsultation } = useApp();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [concern, setConcern] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !concern) return;

    const savedUser = localStorage.getItem("siddha_user");
    let uId = "";
    if (savedUser) {
      const u = JSON.parse(savedUser);
      uId = u.id;
    }

    const ok = await submitConsultation({
      fullName,
      phone,
      email,
      healthConcern: concern,
      detailedNote: symptoms,
      userId: uId
    });

    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFullName("");
        setPhone("");
        setEmail("");
        setConcern("");
        setSymptoms("");
        onClose();
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-4 border border-emerald-100 relative animate-fadeIn max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold cursor-pointer"
        >
          ×
        </button>

        {success ? (
          <div className="text-center py-8 space-y-3">
            <span className="text-4xl text-emerald-600 block">🌿</span>
            <h3 className="text-xl font-bold text-gray-800">{t("appointment.successTitle")}</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              {t("appointment.successMessage")}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center">
              <span className="text-[10px] bg-siddha-light text-siddha-dark font-extrabold px-3 py-1 rounded-full uppercase tracking-wider block w-fit mx-auto">
                {t("appointment.badge")}
              </span>
              <h3 className="text-xl font-black text-gray-850 font-display mt-2 leading-none">{t("appointment.title")}</h3>
              <p className="text-xs text-slate-450 mt-1">{t("appointment.subtitle")}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-450 uppercase">{t("appointment.yourName")}</label>
                <input
                  type="text"
                  placeholder={t("appointment.namePlaceholder")}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-150 focus:border-siddha-dark rounded-xl text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-450 uppercase">{t("appointment.mobileContact")}</label>
                <input
                  type="text"
                  placeholder={t("appointment.mobilePlaceholder")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-150 focus:border-siddha-dark rounded-xl text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-450 uppercase">{t("appointment.emailAddress")}</label>
              <input
                type="email"
                placeholder={t("appointment.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-150 focus:border-siddha-dark rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-450 uppercase">{t("appointment.healthConcern")}</label>
              <select
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-150 focus:border-siddha-dark rounded-xl text-xs cursor-pointer"
                required
              >
                <option value="">{t("appointment.selectConcern")}</option>
                <option value="Respiratory or Cough (Kabham)">{t("appointment.concernKabham")}</option>
                <option value="Gastric or Acid Reflux (Pitham)">{t("appointment.concernPitham")}</option>
                <option value="Joint or muscular stiff (Vatham)">{t("appointment.concernVatham")}</option>
                <option value="Eczema, Psoriasis or Skin rashes">{t("appointment.concernSkin")}</option>
                <option value="General Immunity or booster">{t("appointment.concernImmunity")}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-450 uppercase">{t("appointment.describeSymptoms")}</label>
              <textarea
                placeholder={t("appointment.symptomsPlaceholder")}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-150 focus:border-siddha-dark rounded-xl text-xs resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-siddha-dark hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              {t("appointment.confirmAppointment")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function MainAppContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const { toasts, removeToast } = useToastContext();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-gray-800">
      
      <ScrollToTop />

      {/* Dynamic Header navbar */}
      <Navbar onConsultationClick={() => setModalOpen(true)} />

      {/* Primary content area */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home onConsultationClick={() => setModalOpen(true)} />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/products/:id" element={<ProductDetails />} />

          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/account" element={<Account />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:id" element={<BlogDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/orders-history" element={<OrdersHistory />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}

      {/* Dynamic Appointment Modal dialog triggerable from anywhere */}
      <ConsultationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Siddhar Agathiyar AI assistance Floating Chatbot */}
      <SiddhaAIChatbot />

      {/* Global Toast notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const location = useLocation();
  if (!user) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return <>{children}</>;
}

function AppWithToast() {
  return (
    <ToastProvider>
      <MainAppContent />
    </ToastProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppWithToast />
      </AppProvider>
    </BrowserRouter>
  );
}
