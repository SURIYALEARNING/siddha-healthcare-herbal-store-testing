import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ChevronLeft, ShieldCheck, ShoppingBag, CreditCard, Landmark, Truck } from "lucide-react";

export default function Checkout() {
  const { cart, activeCoupon, user, submitOrder, error } = useApp();
  const navigate = useNavigate();


  // Shipping form fields
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("Tamil Nadu");
  const [district, setDistrict] = useState("");
  const [pincode, setPincode] = useState("");

  // Payment option Selection
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const subtotal = cart.reduce((acc, item) => acc + (item.discountPrice * item.quantity), 0);
  const discountAmount = activeCoupon ? Math.round(subtotal * (activeCoupon.percent / 100)) : 0;
  const deliveryCharges = subtotal > 500 ? 0 : 50;
  const total = subtotal - discountAmount + deliveryCharges;

  // Prefill fields if user is logged in
  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setMobileNumber(user.mobileNumber || "");
      setEmail(user.email);
      if (user.address) {
        setAddress(user.address.address || "");
        setState(user.address.state || "Tamil Nadu");
        setDistrict(user.address.district || "");
        setPincode(user.address.pincode || "");
      }
    }
  }, [user]);

  // If cart is empty, redirect off checkout
  useEffect(() => {
    if (cart.length === 0 && !orderSubmitting) {
      navigate("/cart");
    }
  }, [cart, navigate, orderSubmitting]);

  const handleOrderSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!fullName || !mobileNumber || !address || !state || !district || !pincode) {
      setValidationError("Please fill out all required shipping fields.");
      return;
    }

    if (!/^[0-9]{10}$/.test(mobileNumber)) {
      setValidationError("Please specify a valid 10-digit mobile number.");
      return;
    }

    if (!/^[0-9]{6}$/.test(pincode)) {
      setValidationError("Please specify a valid 6-digit postal pincode.");
      return;
    }

    setOrderSubmitting(true);

    const shippingAddress = {
      address,
      state,
      district,
      pincode
    };

    // Call submitOrder inside context (interacts with backend /api/orders)
    const placedOrder = await submitOrder(
      shippingAddress,
      mobileNumber,
      email,
      fullName,
      paymentMethod
    );

    setOrderSubmitting(false);

    if (placedOrder) {
      // Navigate to tracking index passing state
      navigate("/track-order", { state: { justPlacedId: placedOrder.id } });
    }
  };

  const paymentMethodsList = [
    { id: "UPI", title: "UPI (GPay / PhonePe / Paytm)", icon: "⚡" },
    { id: "Credit Card", title: "Credit Card / Net Banking", icon: "💳" },
    { id: "Debit Card", title: "Debit Card Solutions", icon: "🌐" },
    { id: "Net Banking", title: "Bank Netbanking Transfer", icon: "🏦" },
    { id: "Cash on Delivery", title: "Cash on Delivery (COD)", icon: "🚚" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Back button */}
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

      <form onSubmit={handleOrderSubmission} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

        {/* SHIPPING FORM & PAYMENT SELECTOR - LEFT COLUMN (8 cols) */}
        <div className="lg:col-span-8 space-y-8">

          {/* Shipping segment */}
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
                <input
                  type="text"
                  placeholder="Ex. Suriyashankara Bose"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-800 font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">10-Digit Mobile Number *</label>
                <input
                  type="text"
                  placeholder="Ex. 9876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-800 font-medium font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Email Address (Optional)</label>
              <input
                type="email"
                placeholder="Ex. suriyashankara@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Local Address (Door, Street, Colony) *</label>
              <input
                type="text"
                placeholder="Ex. Door 10/A, Organic Garden House"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-800"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">District *</label>
                <input
                  type="text"
                  placeholder="Ex. Madurai / Coimbatore"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-800 font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">State *</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark rounded-xl text-xs text-gray-700 font-semibold cursor-pointer"
                >
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">6-Digit Pincode *</label>
                <input
                  type="text"
                  placeholder="Ex. 600001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-800 font-medium font-mono"
                  required
                />
              </div>
            </div>

            {!user && (
              <p className="text-[11px] bg-amber-50 text-amber-900 px-3.5 py-2.5 rounded-xl font-medium border border-amber-200">
                You are purchasing as a Guest shopper. You can
                <Link to="/auth" className="text-siddha-dark font-black underline ml-1">Login/Register</Link> to save addresses and track statuses in My Account history!
              </p>
            )}

          </div>

          {/* Payment Selection segment */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <h3 className="text-base font-bold font-display text-emerald-950">2. Select Payment Route</h3>
            <p className="text-xs text-gray-400 block pb-1">Gateway integrations are encapsulated modularly. Razorpay triggers can be attached natively later.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {paymentMethodsList.map((payOpt) => {
                const isSelected = paymentMethod === payOpt.id;
                return (
                  <button
                    key={payOpt.id}
                    type="button"
                    onClick={() => setPaymentMethod(payOpt.id)}
                    className={`p-4 border text-left rounded-2xl flex items-center justify-between cursor-pointer group transition-all duration-150 ${isSelected
                        ? "border-siddha-dark bg-emerald-50/50"
                        : "border-gray-150 hover:bg-slate-50"
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{payOpt.icon}</span>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-950">{payOpt.title}</h4>
                        <p className="text-[9px] text-gray-400 uppercase font-semibold mt-0.5">
                          {payOpt.id === "Cash on Delivery" ? "Pay at your door" : "100% Secured Netway"}
                        </p>
                      </div>
                    </div>

                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? "border-siddha-dark bg-siddha-dark text-white" : "border-gray-300"
                      }`}>
                      {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ORDER REVIEW SUMMARY - RIGHT COLUMN (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-3xl p-6 sticky top-24 shadow-xs space-y-6">
          <h3 className="text-base font-bold font-display text-emerald-950 flex items-center">
            <ShoppingBag className="w-4.5 h-4.5 text-siddha-dark mr-1.5" />
            Order Preview ({cart.length})
          </h3>

          <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 pr-1 space-y-3">
            {cart.map((item) => (
              <div key={item.productId} className="flex items-center space-x-3 pt-3 first:pt-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-emerald-950 truncate">{item.name}</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">₹{item.discountPrice} x {item.quantity}</p>
                </div>
                <span className="text-xs font-bold text-gray-800">₹{item.discountPrice * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3.5 text-xs text-gray-500 font-medium">
            <div className="flex justify-between">
              <span>Items Total:</span>
              <span className="text-gray-800 font-bold">₹{subtotal}</span>
            </div>

            {activeCoupon && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Coupon Applied Deduction:</span>
                <span>- ₹{discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Delivery Shipping:</span>
              {deliveryCharges === 0 ? (
                <span className="text-emerald-700 font-black">FREE</span>
              ) : (
                <span className="text-gray-800 font-bold">₹{deliveryCharges}</span>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between text-lg font-black text-gray-800">
              <span>Grand Total cost:</span>
              <span className="text-siddha-dark">₹{total}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-siddha-gold hover:bg-yellow-500 text-siddha-dark font-black text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-lg shadow-yellow-500/10 disabled:opacity-55-disabled h-12"
            disabled={orderSubmitting}
          >
            {orderSubmitting ? (
              <span>Queueing formulation...</span>
            ) : (
              <span>Authorize Order Purchase (₹{total})</span>
            )}
          </button>

          <div className="pt-2 flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Ayush Verified Sourcing</span>
          </div>

        </div>

      </form>
    </div>
  );
}
