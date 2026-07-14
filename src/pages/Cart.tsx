import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, Tag } from "lucide-react";

export default function Cart() {
  const { cart, updateCartQuantity, removeFromCart, activeCoupon, applyCouponCode, removeCoupon } = useApp();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const subtotal = cart.reduce((acc, item) => acc + (item.discountPrice * item.quantity), 0);
  const rawSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const discountAmount = activeCoupon ? Math.round(subtotal * (activeCoupon.percent / 100)) : 0;
  const deliveryCharges = subtotal > 500 || subtotal === 0 ? 0 : 50;
  const total = subtotal - discountAmount + deliveryCharges;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");
    if (!couponInput.trim()) return;

    const validated = await applyCouponCode(couponInput);
    if (validated) {
      setCouponSuccess(`Coupon ${couponInput.toUpperCase()} applied successfully!`);
      setCouponInput("");
    } else {
      setCouponError("Invalid or expired coupon code. Try WELCOME50 or HEALTH20");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-siddha-light text-siddha-dark flex items-center justify-center mx-auto shadow-xs">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-emerald-950 font-display">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          Explore our traditional Siddha medicines to booster your immunity, soothe digestion, or restore skin and hair vitality naturally.
        </p>
        <Link 
          to="/shop" 
          className="inline-block px-6 py-3 bg-siddha-dark text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-950/10"
        >
          Explore Traditional Pharmacy
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="mb-8 border-b border-gray-100 pb-5">
        <h1 className="text-3xl font-bold font-display text-emerald-950 tracking-tight">Shopping Bag</h1>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mt-1">Review your healing selection before checkouts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* CART LIST ITEMS - LEFT COLUMN (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="divide-y divide-gray-100">
            {cart.map((item) => {
              const itemTotal = item.discountPrice * item.quantity;
              const hasDiscount = item.discountPrice < item.price;
              
              return (
                <div key={item.productId} className="py-6 first:pt-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  
                  {/* Photo details left */}
                  <div className="flex items-center space-x-4 flex-1">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-20 h-20 object-cover rounded-xl border border-gray-100 bg-slate-50 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <Link to={`/products/${item.productId}`} className="hover:text-siddha-dark transition-colors">
                        <h4 className="font-bold text-emerald-950 text-xs sm:text-sm tracking-tight leading-snug">
                          {item.name}
                        </h4>
                      </Link>
                      
                      <div className="flex items-center mt-2.5 space-x-2">
                        <span className="text-sm font-black text-siddha-dark">₹{item.discountPrice}</span>
                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through">₹{item.price}</span>
                        )}
                        <span className="text-[10px] text-gray-400 uppercase font-black">per unit</span>
                      </div>
                    </div>
                  </div>

                  {/* Right options right */}
                  <div className="flex justify-between items-center sm:justify-end w-full sm:w-auto sm:space-x-8">
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 h-8">
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        className="px-2.5 font-bold text-gray-650 hover:text-black"
                      >
                        -
                      </button>
                      <span className="px-3.5 text-xs font-semibold text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        className="px-2.5 font-bold text-gray-650 hover:text-black"
                      >
                        +
                      </button>
                    </div>

                    {/* Cost aggregate */}
                    <div className="text-right sm:min-w-20">
                      <p className="text-sm font-black text-gray-800">₹{itemTotal}</p>
                    </div>

                    {/* Trash Delete */}
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                      title="Remove product"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                  </div>

                </div>
              );
            })}
          </div>

          {/* Continue button */}
          <div className="pt-4 border-t border-gray-50 flex items-center justify-between flex-wrap gap-2">
            <Link 
              to="/shop" 
              className="text-xs font-bold text-siddha-dark hover:underline uppercase tracking-wider"
            >
              ← Back to Shopping Pharmacy
            </Link>
            <p className="text-xs text-gray-400 font-semibold uppercase">
              Free Delivery on orders above ₹500
            </p>
          </div>

        </div>

        {/* CART SUMMARY AND COUPONS - RIGHT COLUMN (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Coupon apply box */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-emerald-950 font-display flex items-center">
              <Tag className="w-4.5 h-4.5 text-siddha-gold mr-1.5" />
              Apply Coupon Code
            </h3>

            {activeCoupon ? (
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest leading-none">
                    {activeCoupon.code} Applied
                  </p>
                  <p className="text-[10px] text-emerald-600/80 mt-1 font-semibold">Special {activeCoupon.percent}% Discount Applied</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-rose-650 hover:text-rose-850 hover:underline shrink-0 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="WELCOME50, HEALTH20"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none uppercase text-gray-700 font-bold tracking-wider"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-siddha-dark text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-emerald-800 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[10px] font-bold text-rose-600">{couponError}</p>}
                {couponSuccess && <p className="text-[10px] font-bold text-emerald-700">{couponSuccess}</p>}
              </form>
            )}
          </div>

          {/* Cart Cost summary */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-emerald-950 font-display">Cart Cost Summary</h3>

            <div className="space-y-3.5 text-xs text-gray-500 font-medium">
              <div className="flex justify-between">
                <span>Items Cost Subtotal:</span>
                <span className="text-gray-800 font-bold">₹{subtotal}</span>
              </div>
              
              {activeCoupon && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount ({activeCoupon.percent}%):</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping Delivery Fee:</span>
                {deliveryCharges === 0 ? (
                  <span className="text-emerald-700 font-black">FREE</span>
                ) : (
                  <span className="text-gray-800 font-bold">₹{deliveryCharges}</span>
                )}
              </div>

              {deliveryCharges > 0 && (
                <p className="text-[9px] text-[#D4AF37] font-bold uppercase leading-none text-right">Add ₹{500 - subtotal} more for Free Delivery</p>
              )}

              <div className="border-t border-gray-100 pt-4 flex justify-between text-base font-black text-gray-800">
                <span>Order Total cost:</span>
                <span className="text-siddha-dark">₹{total}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full py-4 px-6 bg-siddha-dark hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-siddha-gold" />
            </button>

            <div className="pt-2 flex items-center justify-center space-x-2 text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>SSL Protected Checkout</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
