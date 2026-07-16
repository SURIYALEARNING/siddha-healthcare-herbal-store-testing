import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface ShippingFormProps {
  fullName: string; setFullName: (v: string) => void;
  mobileNumber: string; setMobileNumber: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  address: string; setAddress: (v: string) => void;
  state: string; setState: (v: string) => void;
  district: string; setDistrict: (v: string) => void;
  pincode: string; setPincode: (v: string) => void;
  validationError: string;
  error: string | null;
  user: any;
}

export default function ShippingForm({
  fullName, setFullName, mobileNumber, setMobileNumber, email, setEmail,
  address, setAddress, state, setState, district, setDistrict, pincode, setPincode,
  validationError, error, user,
}: ShippingFormProps) {
  return (
    <>
      <Link
        to="/cart"
        className="inline-flex items-center space-x-1 text-xs font-bold text-gray-500 hover:text-siddha-dark uppercase tracking-wider mb-6 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Return to Cart bags</span>
      </Link>

      <div className="mb-8 border-b border-gray-100 pb-5">
        <h1 className="text-3xl font-bold font-display text-emerald-950 tracking-tight">Checkout Gate</h1>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mt-1">Specify destination address & select payments</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
        <h3 className="text-base font-bold font-display text-emerald-950">1. Shipping & Contact details</h3>

        {validationError && (
          <p className="p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs font-bold">
            {validationError}
          </p>
        )}

        {error && (
          <p className="p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs font-bold font-mono">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Full Legal Name *</label>
            <input type="text" placeholder="Ex. Suriyashankara Bose" value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-800 font-medium" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">10-Digit Mobile Number *</label>
            <input type="text" placeholder="Ex. 9876543210" value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-800 font-medium font-mono" required />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Email Address (Optional)</label>
          <input type="email" placeholder="Ex. suriyashankara@gmail.com" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-800" />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Local Address (Door, Street, Colony) *</label>
          <input type="text" placeholder="Ex. Door 10/A, Organic Garden House" value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-800" required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">District *</label>
            <input type="text" placeholder="Ex. Madurai / Coimbatore" value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-800 font-medium" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">State *</label>
            <select value={state} onChange={(e) => setState(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark rounded-xl text-xs text-gray-700 font-semibold cursor-pointer">
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Kerala">Kerala</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">6-Digit Pincode *</label>
            <input type="text" placeholder="Ex. 600001" value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-800 font-medium font-mono" required />
          </div>
        </div>

        {!user && (
          <p className="text-[11px] bg-amber-50 text-amber-900 px-3.5 py-2.5 rounded-xl font-medium border border-amber-200">
            You are purchasing as a Guest shopper. You can
            <Link to="/auth" className="text-siddha-dark font-black underline ml-1">Login/Register</Link> to save addresses and track statuses in My Account history!
          </p>
        )}
      </div>
    </>
  );
}
