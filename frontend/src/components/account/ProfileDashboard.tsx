import { useState, useEffect } from "react";
import type { User } from "../../types";

interface ProfileDashboardProps {
  user: User;
  onSave: (fullName: string, mobileNumber: string, address: {
    address: string; state: string; district: string; pincode: string;
  }) => Promise<boolean>;
}

export default function ProfileDashboard({ user, onSave }: ProfileDashboardProps) {
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("Tamil Nadu");
  const [district, setDistrict] = useState("");
  const [pincode, setPincode] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setFullName(user.fullName);
    setMobileNumber(user.mobileNumber || "");
    if (user.address) {
      setAddress(user.address.address || "");
      setState(user.address.state || "Tamil Nadu");
      setDistrict(user.address.district || "");
      setPincode(user.address.pincode || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    const ok = await onSave(fullName, mobileNumber, { address, state, district, pincode });

    if (ok) {
      setSuccessMsg("Profile and Shipping address updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      setErrorMsg("Failed to modify user profile. Try again.");
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-gray-850 uppercase tracking-wider border-b border-gray-50 pb-2.5">Profile Management</h3>

      {successMsg && (
        <p className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-bold">{successMsg}</p>
      )}
      {errorMsg && (
        <p className="p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs font-bold font-mono">{errorMsg}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Registered Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs font-medium text-gray-800 focus:outline-none"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Mobile Number</label>
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs font-medium text-gray-800 focus:outline-none font-mono"
              required
            />
          </div>
        </div>

        <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-dashed border-gray-150">
          <label className="text-[10px] font-bold text-gray-400 uppercase block">Registered Authorization Email</label>
          <span className="text-xs font-bold text-emerald-950 font-mono select-all block mt-1">{user.email}</span>
          <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider mt-1 leading-none">• Email addresses are unique credentials and cannot be changed.</p>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3 mt-4">Default Delivery Address Info:</h4>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Home Address</label>
              <input
                type="text"
                placeholder="Ex. 123/B, Prime Colony Street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">District</label>
                <input
                  type="text"
                  placeholder="Ex. Coimbatore"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">State</label>
                <input
                  type="text"
                  value={state}
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-150 rounded-xl text-xs text-gray-500 font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase p-0.5">Pincode</label>
                <input
                  type="text"
                  placeholder="Ex. 641004"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="px-6 py-3 bg-siddha-dark text-white rounded-xl text-xs font-bold transition-all hover:bg-emerald-800 cursor-pointer shadow-xs"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
