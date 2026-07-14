import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Search, Loader2, CheckCircle2, Truck, Clock, PackageCheck, Package, ShoppingBag, ShieldCheck } from "lucide-react";

export default function TrackOrder() {
  const { orders } = useApp();
  const location = useLocation();

  const [searchIdInput, setSearchIdInput] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Check state transfers from checkout or account dashboard
  useEffect(() => {
    const state = location.state as { justPlacedId?: string; searchId?: string } | null;
    let targetId = "";
    if (state?.justPlacedId) {
      targetId = state.justPlacedId;
    } else if (state?.searchId) {
      targetId = state.searchId;
    }

    if (targetId) {
      setSearchIdInput(targetId);
      const matched = orders.find(o => o.id === targetId);
      if (matched) {
        setSelectedOrder(matched);
      } else {
        // Fallback search local storage or remote
        fetchOrderRemote(targetId);
      }
    }
  }, [location, orders]);

  const fetchOrderRemote = async (oid: string) => {
    try {
      setErrorMsg("");
      const res = await fetch(`/api/orders/${oid}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data);
      } else {
        setErrorMsg("Could not find order with reference ID. Verify characters.");
        setSelectedOrder(null);
      }
    } catch (err) {
      setErrorMsg("Network failure query order reference. Check backend connectivity.");
      setSelectedOrder(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchIdInput.trim()) return;

    // Search local list first
    const localMatched = orders.find(o => o.id === searchIdInput.trim());
    if (localMatched) {
      setErrorMsg("");
      setSelectedOrder(localMatched);
    } else {
      fetchOrderRemote(searchIdInput.trim());
    }
  };

  // Steps define
  const steps = [
    { label: "Ordered & Confirmed", status: "Ordered", icon: ShoppingBag, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { label: "Packed in Organic Bags", status: "Packed", icon: PackageCheck, color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
    { label: "Handed to Ayush Carrier", status: "Shipped", icon: Truck, color: "text-purple-600 bg-purple-50 border-purple-200" },
    { label: "Out for Local Delivery", status: "Out for Delivery", icon: Package, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { label: "Delivered Healthy", status: "Delivered", icon: CheckCircle2, color: "text-emerald-700 bg-emerald-50 border-emerald-200" }
  ];

  // Resolve active index
  const getActiveStepIndex = (statusStr: string) => {
    const index = steps.findIndex(s => s.status.toLowerCase() === statusStr.toLowerCase());
    return index !== -1 ? index : 0;
  };

  const activeIndex = selectedOrder ? getActiveStepIndex(selectedOrder.status) : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Search Header card */}
      <div className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-10 space-y-4 shadow-xs text-center">
        <h1 className="text-3xl font-bold font-display text-emerald-950 tracking-tight leading-none">
          Live Logistics Courier Tracker
        </h1>
        <p className="text-xs text-slate-450 font-semibold uppercase tracking-wider max-w-lg mx-auto leading-normal">
          Track clinical formulations shipped from Ayush Pharmacy warehouse straight to your hands
        </p>

        <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto pt-3 flex gap-1.5 flex-col sm:flex-row">
          <input 
            type="text"
            placeholder="Ex. ORD-94825"
            value={searchIdInput}
            onChange={(e) => setSearchIdInput(e.target.value)}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white focus:outline-none rounded-xl text-xs sm:text-sm font-semibold tracking-widest text-center uppercase text-gray-850"
            required
          />
          <button 
            type="submit"
            className="px-6 py-3 bg-siddha-dark hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1 shrink-0"
          >
            <Search className="w-4 h-4 text-siddha-gold" />
            <span>Track Order</span>
          </button>
        </form>

        {errorMsg && (
          <p className="text-xs font-bold text-rose-650 bg-rose-50 border border-rose-100 p-2.5 rounded-xl max-w-md mx-auto">
            ⚠ {errorMsg}
          </p>
        )}
      </div>

      {/* TRACKING TIMELINE DISPLAY SCREEN */}
      {selectedOrder ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 space-y-8 shadow-xs">
          
          {/* Order Brief */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-black text-gray-400">Order ID:</span>
              <p className="text-base font-black text-siddha-dark font-mono mt-0.5 leading-none">{selectedOrder.id}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-gray-400">Placed Date:</span>
              <p className="text-xs text-gray-650 font-bold mt-1 leading-none">
                {new Date(selectedOrder.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-gray-400">Paid Amount:</span>
              <p className="text-base font-black text-gray-800 font-mono mt-0.5 leading-none">₹{selectedOrder.total}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-gray-400 font-mono">Status Indicator:</span>
              <span className="block mt-1 text-[9px] font-bold uppercase bg-siddha-light text-siddha-dark px-2.5 py-0.5 rounded border border-emerald-250 leading-none">
                {selectedOrder.status}
              </span>
            </div>
          </div>

          {/* Stepper Timeline Graphics */}
          <div className="space-y-6 pt-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Logistics Process Progress</h3>
            
            <div className="relative pl-8 sm:pl-0 sm:grid sm:grid-cols-5 gap-4">
              
              {/* Desktop connected trace line */}
              <div className="hidden sm:block absolute top-5 left-1/10 right-1/10 h-0.5 bg-gray-100 z-0">
                <div 
                  className="h-full bg-siddha-dark transition-all duration-500"
                  style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>

              {/* Mobile connected line */}
              <div className="sm:hidden absolute top-4 bottom-4 left-3.5 w-0.5 bg-gray-100 z-0">
                <div 
                  className="w-full bg-siddha-dark transition-all duration-500"
                  style={{ height: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>

              {steps.map((step, idx) => {
                const isCompleted = idx <= activeIndex;
                const isCurrent = idx === activeIndex;
                const IconComp = step.icon;

                return (
                  <div 
                    key={step.status} 
                    className={`relative z-10 flex sm:flex-col items-start sm:items-center text-left sm:text-center sm:space-y-2 mb-6 sm:mb-0`}
                  >
                    
                    {/* Circle icon marker */}
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      isCompleted 
                        ? "bg-siddha-dark text-white border-siddha-dark shadow-md" 
                        : "bg-white text-gray-300 border-gray-200"
                    } ${isCurrent ? "ring-4 ring-emerald-100 scale-105" : ""}`}>
                      <IconComp className="w-4 h-4" />
                    </div>

                    {/* text contents */}
                    <div className="pl-4 sm:pl-0">
                      <h4 className={`text-xs font-bold tracking-tight ${isCompleted ? "text-emerald-950" : "text-gray-400"}`}>
                        {step.label}
                      </h4>
                      <p className={`text-[10px] font-medium leading-none mt-1 uppercase ${
                        isCurrent ? "text-emerald-700" : isCompleted ? "text-gray-500" : "text-gray-300"
                      }`}>
                        {isSelectedOrder(step.status, selectedOrder.status) ? "In Transit" : isCompleted ? "Complete" : "Pending"}
                      </p>
                    </div>

                  </div>
                );
              })}

            </div>
          </div>

          {/* Delivery Location address card */}
          <div className="border-t border-gray-50 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Delivery Destination</h4>
              <p className="text-xs font-bold text-gray-700 leading-none">{selectedOrder.fullName}</p>
              <p className="text-xs text-gray-500 leading-normal">
                {selectedOrder.shippingAddress.address}<br />
                {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
              </p>
              <p className="text-[11px] text-gray-400 font-mono">Contact phone: {selectedOrder.mobileNumber}</p>
            </div>

            <div className="space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded font-mono uppercase">
                  Logistics Carrier Info
                </span>
                <p className="text-xs text-gray-500 mt-2">
                  Carrier partner: Professional Couriers (Tamil Nadu Delivery Networks)<br />
                  Tracking air waybill (AWB): <strong>AYUSH-ST-{selectedOrder.id.substring(4)}</strong>
                </p>
              </div>
              <div className="flex items-center space-x-1 text-[11px] text-emerald-700 font-bold uppercase tracking-wider leading-none">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Ministry of AYUSH secure logistics</span>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-10 bg-white border border-gray-100 rounded-3xl p-6 shadow-xs max-w-sm mx-auto space-y-2.5">
          <Clock className="w-10 h-10 text-gray-300 mx-auto" />
          <h4 className="font-bold text-emerald-950 text-sm">Waiting for order reference ID</h4>
          <p className="text-xs text-gray-400 leading-normal font-light">Enter an order ID in the search bar above to see historical live courier transitions.</p>
        </div>
      )}

    </div>
  );
}

function isSelectedOrder(stepStatus: string, orderStatus: string) {
  return stepStatus.toLowerCase() === orderStatus.toLowerCase();
}
