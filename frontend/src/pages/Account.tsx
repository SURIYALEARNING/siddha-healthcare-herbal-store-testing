import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { 
  Settings, 
  ShoppingBag, 
  MapPin, 
  Heart, 
  LogOut, 
  CheckCircle2, 
  Search, 
  Clock, 
  ChevronRight, 
  AlertCircle 
} from "lucide-react";

export default function Account() {
  const { user, orders, wishlist, products, updateUserProfile, logoutUser } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "addresses" | "wishlist">("dashboard");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Profile states
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("Tamil Nadu");
  const [district, setDistrict] = useState("");
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else {
      setFullName(user.fullName);
      setMobileNumber(user.mobileNumber || "");
      if (user.address) {
        setAddress(user.address.address || "");
        setState(user.address.state || "Tamil Nadu");
        setDistrict(user.address.district || "");
        setPincode(user.address.pincode || "");
      }
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    const billingAddress = { address, state, district, pincode };
    const success = await updateUserProfile(fullName, mobileNumber, billingAddress);

    if (success) {
      setSuccessMsg("Profile and Shipping address updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      setErrorMsg("Failed to modify user profile. Try again.");
    }
  };

  const handleSignOut = () => {
    logoutUser();
    navigate("/");
  };

  // Resolve products in wishlist
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Welcome strip */}
      <div className="bg-gradient-to-r from-emerald-950 to-siddha-dark p-6 sm:p-8 rounded-3xl text-white mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-siddha-light rounded-full filter blur-3xl opacity-10"></div>
        <div className="space-y-1.5 z-10">
          <p className="text-[10px] font-bold text-siddha-gold uppercase tracking-widest block">Buyer Console</p>
          <h1 className="text-2xl sm:text-3.5xl font-black font-display tracking-tight">Vanakkam, {user.fullName}!</h1>
          <p className="text-xs text-emerald-200">Manage your custom traditional prescriptions and orders history easily</p>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer z-10 flex items-center space-x-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* TAB CONTROLS SIDEBAR (Desktop) */}
        <div className="lg:col-span-3 bg-white border border-gray-100 p-5 rounded-2xl flex flex-col space-y-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-left flex items-center space-x-2.5 transition-colors cursor-pointer ${
              activeTab === "dashboard" ? "bg-siddha-dark text-white" : "text-gray-500 hover:bg-slate-50"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Profile Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-left flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === "orders" ? "bg-siddha-dark text-white" : "text-gray-500 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <ShoppingBag className="w-4 h-4" />
              <span>Orders Timeline</span>
            </div>
            {orders.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                activeTab === "orders" ? "bg-emerald-800 text-white" : "bg-siddha-light text-siddha-dark"
              }`}>
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`w-full px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-left flex items-center space-x-2.5 transition-colors cursor-pointer ${
              activeTab === "addresses" ? "bg-siddha-dark text-white" : "text-gray-500 hover:bg-slate-50"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Shipping Address</span>
          </button>

          <button
            onClick={() => setActiveTab("wishlist")}
            className={`w-full px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-left flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === "wishlist" ? "bg-siddha-dark text-white" : "text-gray-500 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Heart className="w-4 h-4" />
              <span>My Wishlist</span>
            </div>
            {wishlist.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                activeTab === "wishlist" ? "bg-emerald-800 text-white" : "bg-rose-100 text-rose-700"
              }`}>
                {wishlist.length}
              </span>
            )}
          </button>
        </div>

        {/* DETAILS WORKSPACE - RIGHT COLUMN (9 cols) */}
        <div className="lg:col-span-9 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8">
          
          {/* 1. DASHBOARD PROFILE UPDATE TAB */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-gray-850 uppercase tracking-wider border-b border-gray-50 pb-2.5">Profile Management</h3>
              
              {successMsg && (
                <p className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-bold">
                  {successMsg}
                </p>
              )}

              {errorMsg && (
                <p className="p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs font-bold font-mono">
                  {errorMsg}
                </p>
              )}

              <form onSubmit={handleProfileUpdate} className="space-y-4">
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
                          className="w-full px-4 py-2.5 bg-[#e2e8f0]/30 border border-gray-150 rounded-xl text-xs text-gray-500 font-semibold"
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
          )}

          {/* 2. ORDERS TIMELINE TAB */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-gray-850 uppercase tracking-wider border-b border-gray-50 pb-2.5">Orders Timeline History</h3>

              {orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.map((o) => (
                    <div key={o.id} className="border border-gray-150 rounded-2xl p-5 hover:border-emerald-100 transition-all space-y-4 bg-slate-50/50">
                      
                      {/* Top headers */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-100 pb-3">
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order Reference</p>
                          <p className="text-sm font-bold text-siddha-dark font-mono mt-0.5">{o.id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Timeline Date</p>
                          <p className="text-xs text-gray-600 font-medium mt-0.5">{new Date(o.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Status Timeline</p>
                          <span className="inline-block mt-0.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-siddha-dark">
                            {o.status}
                          </span>
                        </div>
                        <Link
                          to="/track-order"
                          state={{ searchId: o.id }}
                          className="px-4 py-2 bg-siddha-dark hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs h-fit text-center cursor-pointer"
                        >
                          Track Status Stepper
                        </Link>
                      </div>

                      {/* Items details */}
                      <div className="space-y-3">
                        {o.items.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-3 text-xs leading-none">
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded border bg-white" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-emerald-950 truncate">{item.name}</h4>
                              <p className="text-[10px] text-gray-400 uppercase font-semibold mt-1">₹{item.price} x {item.quantity}</p>
                            </div>
                            <span className="font-black text-gray-800">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Sum up values */}
                      <div className="border-t border-gray-100 pt-3.5 flex justify-between items-center text-xs text-gray-500 flex-wrap gap-2">
                        <div className="flex items-center space-x-1 font-semibold uppercase text-[10px]">
                          <span>Method:</span>
                          <span className="text-gray-700 font-bold">{o.paymentMethod}</span>
                          <span className="text-[9px] text-[#D4AF37] font-black border border-amber-300 px-1 rounded ml-1">{o.paymentStatus}</span>
                        </div>

                        <div className="flex space-x-1.5 items-baseline">
                          <span className="font-semibold uppercase text-[10px]">Total cost paid:</span>
                          <span className="text-sm font-black text-siddha-dark font-mono">₹{o.total}</span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-emerald-950">No orders logged</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">You haven't purchased any tradicional remedies with this account yet.</p>
                  <Link to="/shop" className="inline-block px-4 py-2 bg-siddha-dark text-white rounded-xl text-xs font-bold font-sans">Shop Remedies</Link>
                </div>
              )}
            </div>
          )}

          {/* 3. SHIPPING ADDRESS DETAILS TAB */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-gray-850 uppercase tracking-wider border-b border-gray-50 pb-2.5">Saved Shipping Address</h3>

              {user.address ? (
                <div className="border border-gray-150 rounded-2xl p-5 space-y-3 bg-slate-50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-siddha-light rounded-full filter blur-xl opacity-20"></div>
                  <div className="flex justify-between items-start z-10 relative">
                    <div>
                      <span className="text-[10px] bg-siddha-light text-siddha-dark font-bold px-2 py-0.5 rounded uppercase tracking-wider">Default Delivery Destination</span>
                      <h4 className="font-bold text-emerald-950 mt-2.5">{user.fullName}</h4>
                      <p className="text-xs text-gray-500 leading-normal mt-1">{user.address.address}</p>
                      <p className="text-xs text-gray-500 font-semibold leading-none mt-1">{user.address.district}, {user.address.state} - {user.address.pincode}</p>
                      <p className="text-xs font-medium text-gray-400 font-mono mt-2 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 shrink-0"></span>
                        Mobile Contact: {user.mobileNumber}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-gray-250 rounded-2xl p-6">
                  <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-400 mt-2">No dynamic shipping address stored yet. Go back to Profile tab and enter address fields.</p>
                </div>
              )}
            </div>
          )}

          {/* 4. MY WISHLIST TAB */}
          {activeTab === "wishlist" && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-gray-850 uppercase tracking-wider border-b border-gray-50 pb-2.5">Saved Healing Favorites</h3>

              {wishlistProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistProducts.map((p) => (
                    <div key={p.id} className="border border-gray-150 rounded-2xl p-4 flex items-center space-x-3 hover:border-emerald-150 transition-all">
                      <img src={p.images[0]} alt={p.name} className="w-16 h-16 object-cover rounded-xl bg-slate-50" />
                      
                      <div className="flex-1 min-w-0 space-y-1">
                        <Link to={`/products/${p.id}`} className="hover:text-siddha-dark transition-colors">
                          <h4 className="text-xs font-bold text-emerald-950 truncate leading-none mb-1">{p.name}</h4>
                        </Link>
                        <p className="text-[10px] text-gray-400 font-semibold leading-none uppercase">{p.category}</p>
                        <div className="pt-1 select-none">
                          <span className="text-xs font-black text-siddha-dark">₹{p.discountPrice}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Link
                          to={`/products/${p.id}`}
                          className="px-2.5 py-1 bg-siddha-light hover:bg-[#cbfcd9] text-siddha-dark text-[10px] font-bold rounded"
                        >
                          View
                        </Link>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-3">
                  <div className="w-12 h-12 bg-gray-105 rounded-full flex items-center justify-center mx-auto text-gray-405">
                    <Heart className="w-6 h-6 text-gray-400" />
                  </div>
                  <h4 className="font-bold text-emerald-950">Wishlist empty</h4>
                  <p className="text-xs text-gray-450 max-w-sm mx-auto">No remedies bookmarked. Browse our pharmacy and tap the heart icon to save.</p>
                  <Link to="/shop" className="inline-block px-4 py-2 bg-siddha-dark text-white rounded-xl text-xs font-bold font-sans">Browse Remedies</Link>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
