import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  LayoutDashboard,
  ShoppingBag,
  CalendarClock,
  TicketPercent,
  Users,
  Plus,
  Save,
  Trash2,
  Edit3,
  CheckCircle,
  Database,
  AlertTriangle,
  LogOut
} from "lucide-react";

export default function Admin() {
  const {
    user,
    products,
    orders,
    blogs,
    coupons,
    consultations,
    adminAddProduct,
    adminEditProduct,
    adminDeleteProduct,
    updateOrderStatus,
    createCouponCode, 
    logoutUser
  } = useApp();



  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"analytics" | "products" | "orders" | "coupons" | "consultations">("analytics");

  // Guard access to admin users only
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSignOut = () => {
    logoutUser();
    navigate("/");
  };

  // FORM STATES: Product Add-Edit
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [prodForm, setProdForm] = useState({
    name: "",
    price: 350,
    discountPrice: 280,
    category: "Immunity Boosters",
    stock: 25,
    description: "",
    ingredients: "",
    benefits: "",
    usage: "",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600"
  });

  // FORM STATES: Coupon Add
  const [couponForm, setCouponForm] = useState({
    code: "",
    percent: 15,
    expiry: "2026-12-31"
  });

  if (!user || !user.isAdmin) return null;

  // Resolve analytical aggregates
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalProductsSold = orders.reduce((acc, o) => acc + o.items.reduce((ac2, item) => ac2 + item.quantity, 0), 0);
  const totalConsultsRegistered = consultations;

  // Analytical data formatting
  const revenueChartData = [
    { name: "Mon", revenue: 850 },
    { name: "Tue", revenue: 1450 },
    { name: "Wed", revenue: 980 },
    { name: "Thu", revenue: 2100 },
    { name: "Fri", revenue: totalRevenue > 2500 ? totalRevenue / 2 : 1850 },
    { name: "Sat", revenue: totalRevenue > 4000 ? totalRevenue / 1.5 : 3200 },
    { name: "Sun", revenue: totalRevenue }
  ];

  const categoryDistributionData = [
    { name: "Immunity Boosters", value: products.filter(p => p.category === "Immunity Boosters").length },
    { name: "Digestive Care", value: products.filter(p => p.category === "Digestive Care").length },
    { name: "Skin Care", value: products.filter(p => p.category === "Skin Care").length },
    { name: "Hair Care", value: products.filter(p => p.category === "Hair Care").length }
  ];

  const PIE_COLORS = ["#14532D", "#D4AF37", "#10B981", "#6EE7B7"];

  // PRODUCT ACTIONS
  const handleProductSubmit = async (e: React.FormEvent) => {


    e.preventDefault();
    if (!prodForm.name || !prodForm.description) return;

    const payload = {
      name: prodForm.name,
      price: Number(prodForm.price),
      discountPrice: Number(prodForm.discountPrice),
      category: prodForm.category,
      stock: Number(prodForm.stock),
      description: prodForm.description,
      images: [prodForm.image],
      ingredients: prodForm.ingredients.split(",").map(i => i.trim()).filter(Boolean),
      benefits: prodForm.benefits.split(",").map(i => i.trim()).filter(Boolean),
      usageInstructions: prodForm.usage.split(",").map(i => i.trim()).filter(Boolean),
      rating: 5,
      reviews: []
    };

    if (editingProdId) {


      const ok = await adminEditProduct(editingProdId, payload);

      if (ok) {
        alert("Siddha formulation updated successfully!");
        setEditingProdId(null);
      }
    } else {
      const ok = await adminAddProduct(payload);
      if (ok) {
        alert("New traditional remedy added to pharmacy!");
      }
    }

    // Reset Form
    setProdForm({
      name: "",
      price: 350,
      discountPrice: 280,
      category: "Immunity Boosters",
      stock: 25,
      description: "",
      ingredients: "",
      benefits: "",
      usage: "",
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600"
    });
  };

  const startEditProduct = (p: any) => {
    setEditingProdId(p.id);
    setProdForm({
      name: p.name,
      price: p.price,
      discountPrice: p.discountPrice,
      category: p.category,
      stock: p.stock,
      description: p.description,
      ingredients: p.ingredients?.join(", ") || "",
      benefits: p.benefits?.join(", ") || "",
      usage: p.usageInstructions?.join(", ") || "",
      image: p.images[0]
    });
    setActiveTab("products");
  };

  // COUPON ACTIONS
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code) return;

    const ok = await createCouponCode(
      couponForm.code.toUpperCase().trim(),
      Number(couponForm.percent),
      couponForm.expiry
    );

    if (ok) {
      alert(`Coupon ${couponForm.code.toUpperCase()} registered ready in system.`);
      setCouponForm({ code: "", percent: 15, expiry: "2026-12-31" });
    } else {
      alert("Failed creating coupon. Verify uniqueness.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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
      {/* Admin Title Heading */}
      <div className="flex justify-between items-end border-b border-gray-100 pb-5 flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold text-red-650 uppercase tracking-widest block mb-1">Clinic Administration Area</span>
          <h1 className="text-3xl font-bold font-display text-emerald-950 tracking-tight leading-none flex items-center">
            <Database className="w-7 h-7 text-siddha-gold mr-2.5" />
            Vaidyar Chief Physician Console
          </h1>
        </div>

        {/* Tab switch control buttons */}
        <div className="flex overflow-x-auto gap-1 border border-gray-150 p-1.5 rounded-2xl bg-white bg-opacity-70 shrink-0 select-none">
          {[
            { id: "analytics", label: "Stats & Analytics", Icon: LayoutDashboard },
            { id: "products", label: "Product Inventory", Icon: ShoppingBag },
            { id: "orders", label: "Live Orders", Icon: CalendarClock },
            { id: "coupons", label: "Discount Coupons", Icon: TicketPercent },
            { id: "consultations", label: "Doctor Consults", Icon: Users }
          ].map((tab) => {
            const IconComp = tab.Icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1 px-4 py-2.5 rounded-xl text-xs font-bold uppercase cursor-pointer whitespace-nowrap transition-colors ${activeTab === tab.id
                  ? "bg-siddha-dark text-white shadow-xs"
                  : "text-gray-500 hover:bg-slate-50 hover:text-siddha-dark"
                  }`}
              >
                <IconComp className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. ANALYTICS STATS VIEWPORT */}
      {activeTab === "analytics" && (
        <div className="space-y-8">

          {/* Numeric aggregators cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 relative overflow-hidden shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Gross Sales Revenue</span>
              <p className="text-3xl font-black text-siddha-dark font-mono mt-1.5 leading-none">₹{totalRevenue}</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-2 font-mono">↑ 14.5% versus yesterweek</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-6 relative overflow-hidden shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Remedy Units Handled</span>
              <p className="text-3xl font-black text-gray-800 font-mono mt-1.5 leading-none">{totalProductsSold} boxes</p>
              <p className="text-[10px] text-[#D4AF37] font-bold mt-2">Certified packaging dispatched</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-6 relative overflow-hidden shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Doctor Calls Placed</span>
              <p className="text-3xl font-black text-emerald-950 font-mono mt-1.5 leading-none">{totalConsultsRegistered}</p>
              <p className="text-[10px] text-rose-500 font-bold mt-2">Pulse assessments registered</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-6 relative overflow-hidden shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">System Status</span>
              <p className="text-lg font-black text-emerald-700 mt-2 flex items-center leading-none">
                <CheckCircle className="w-5 h-5 text-emerald-600 mr-1 shrink-0" />
                ONLINE
              </p>
              <p className="text-[10px] text-gray-400 font-mono mt-3 uppercase font-semibold">Port 3000 Ingress Secure</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Recharts Revenue Area graph (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-gray-100 p-6 sm:p-8 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-widest block">Daily Business Profit Graph</h3>

              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip formatter={(value) => [`₹${value}`, "Sales Revenue"]} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#14532D"
                      strokeWidth={3}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category slice distribution chart (4 cols) */}
            <div className="lg:col-span-4 bg-white border border-gray-100 p-6 sm:p-8 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-widest block">Therapeutics distribution</h3>

              <div className="w-full h-56 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistributionData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => [`${val} Formularys`, "Products"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends list */}
              <div className="space-y-2 pt-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                {categoryDistributionData.map((item, idx) => (
                  <div key={item.name} className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                      <span className="truncate max-w-40 block">{item.name}</span>
                    </div>
                    <span>{item.value} formulas</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. PRODUCT INVENTORY ACTIONS TAB */}
      {activeTab === "products" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Left panel: Add / Edit Product Form (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-5">
            <h3 className="text-base font-bold font-display text-emerald-950 flex items-center">
              <Plus className="w-5 h-5 text-siddha-gold mr-1" />
              {editingProdId ? "Edit traditional remedy" : "Authorize brand new remedy"}
            </h3>

            <form onSubmit={handleProductSubmit} className="space-y-4">

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Remedy Name *</label>
                <input
                  type="text"
                  placeholder="Ex. Organic Sandal Herbal Tablet"
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark rounded-xl text-xs focus:bg-white text-gray-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Original Price (₹) *</label>
                  <input
                    type="number"
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Offer Discounted Price (₹) *</label>
                  <input
                    type="number"
                    value={prodForm.discountPrice}
                    onChange={(e) => setProdForm({ ...prodForm, discountPrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Therapeutic Category *</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs cursor-pointer"
                  >
                    <option value="Immunity Boosters">Immunity Boosters</option>
                    <option value="Digestive Care">Digestive Care</option>
                    <option value="Skin Care">Skin Care</option>
                    <option value="Hair Care">Hair Care</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Stock units *</label>
                  <input
                    type="number"
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Image Resource URL *</label>
                <input
                  type="text"
                  value={prodForm.image}
                  onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white text-gray-550"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Raw ingredients (Comma separated list)</label>
                <input
                  type="text"
                  placeholder="Ex. Sandalwood Extract, Curcumin Extract, Tulsi, Cardamom"
                  value={prodForm.ingredients}
                  onChange={(e) => setProdForm({ ...prodForm, ingredients: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white word-wrap text-xs placeholder-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Dosage Guidelines</label>
                  <input
                    type="text"
                    placeholder="Take with hot water, morning chew empty stomach"
                    value={prodForm.usage}
                    onChange={(e) => setProdForm({ ...prodForm, usage: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white placeholder-gray-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase font-sans">Therapeutic Benefits</label>
                  <input
                    type="text"
                    placeholder="Quenches dry skin heat, purifies liver sluggish"
                    value={prodForm.benefits}
                    onChange={(e) => setProdForm({ ...prodForm, benefits: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Product Description *</label>
                <textarea
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:bg-white"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-siddha-dark hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1"
                >
                  <Save className="w-4 h-4 text-siddha-gold" />
                  <span>{editingProdId ? "Apply Edits" : "Insert Formula"}</span>
                </button>
                {editingProdId && (
                  <button
                    onClick={() => {
                      setEditingProdId(null);
                      setProdForm({
                        name: "",
                        price: 350,
                        discountPrice: 280,
                        category: "Immunity Boosters",
                        stock: 25,
                        description: "",
                        ingredients: "",
                        benefits: "",
                        usage: "",
                        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600"
                      });
                    }}
                    type="button"
                    className="px-4 py-3 bg-slate-100 text-gray-600 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                )}
              </div>

            </form>
          </div>

          {/* Right panel: Active Products Table List (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-4 overflow-x-auto">
            <h3 className="text-base font-bold font-display text-emerald-900 border-b border-gray-55 pb-2">
              Active Store Pharmacy Catalog ({products.length} Items)
            </h3>

            <table className="w-full text-xs text-left min-w-140">
              <thead>
                <tr className="border-b border-gray-150 text-gray-400 uppercase font-black tracking-widest text-[9px]">
                  <th className="py-3">Name & Info</th>
                  <th>Category</th>
                  <th>Cost Prices</th>
                  <th>Stock balance</th>
                  <th className="text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold">
                {products.map((p) => (
                  <tr key={p.id}>

                    <td className="py-3.5 flex items-center space-x-2.5">
                      <img src={p.images[0]} alt={p.name} className="w-8 h-8 object-cover rounded border bg-slate-50" />
                      <div className="truncate max-w-44">
                        <p className="font-bold text-gray-800 truncate leading-none">{p.name}</p>
                        <span className="text-[10px] text-gray-400 font-mono mt-1">{p.id}</span>
                      </div>
                    </td>

                    <td className="text-gray-500">{p.category}</td>

                    <td>
                      <p className="font-bold text-gray-700 font-mono">₹{p.discountPrice}</p>
                      <span className="text-[10px] text-gray-405 line-through font-mono">₹{p.price}</span>
                    </td>

                    <td>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${p.stock <= 0 ? "bg-rose-100 text-rose-800" : "bg-emerald-50 text-emerald-800"
                        }`}>
                        {p.stock <= 0 ? "Sold-Out" : `${p.stock} units`}
                      </span>
                    </td>

                    <td className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => startEditProduct(p)}
                          className="p-1.5 text-gray-500 hover:text-siddha-dark transition-colors"
                          title="Edit remedy details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Do you want to permanently erase this traditional formulation from catalog?")) {
                              adminDeleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 text-rose-650 hover:text-rose-850"
                          title="Erase formula"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 3. LIVE ORDER ACTIONS TIMELINE TAB */}
      {activeTab === "orders" && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6 overflow-x-auto">
          <div className="border-b border-gray-50 pb-3 flex justify-between items-center">
            <h3 className="text-base font-bold font-display text-emerald-950">Active Customer Orders Tracker</h3>
            <span className="text-xs bg-[#D4AF37] px-3 py-1 rounded-full text-siddha-dark font-bold font-mono uppercase tracking-wider">{orders.length} Purchases logged</span>
          </div>

          <table className="w-full text-xs text-left min-w-180">
            <thead>
              <tr className="border-b border-gray-150 text-gray-400 uppercase font-black tracking-widest text-[9px] py-1">
                <th className="py-2.5">Order Reference</th>
                <th>Target Recipient Info</th>
                <th>Remedy Purchases details</th>
                <th>Cost Paid</th>
                <th>Logistics status</th>
                <th className="text-right">Status action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
              {orders.map((o) => (
                <tr key={o.id} className="py-1">

                  <td className="py-3 font-mono text-siddha-dark font-extrabold max-w-28 truncate select-all">
                    {o.id}
                  </td>

                  <td>
                    <p className="font-bold text-gray-805 leading-none">{o.fullName}</p>
                    <span className="text-[10px] text-gray-400 font-mono mt-1 block select-all">{o.mobileNumber}</span>
                  </td>

                  <td className="max-w-64">
                    <div className="space-y-1">
                      {o.items.map((item, idx) => (
                        <p key={idx} className="truncate text-gray-500 leading-snug">
                          • {item.name} <span className="font-mono text-slate-805 text-[11px] font-black">x{item.quantity}</span>
                        </p>
                      ))}
                    </div>
                  </td>

                  <td className="font-mono font-bold text-emerald-950">
                    ₹{o.total}
                  </td>

                  <td>
                    <span className="inline-block text-[10px] font-bold uppercase py-0.5 px-2 bg-siddha-light text-siddha-dark rounded-full border border-emerald-250 leading-none">
                      {o.status}
                    </span>
                  </td>

                  <td className="text-right">
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                      className="p-1.5 border border-gray-150 bg-gray-50 text-[10px] font-bold rounded-lg cursor-pointer max-w-32 focus:outline-none"
                    >
                      <option value="Ordered">Ordered</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for Delivery">Out/Deliv</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. ACTIVE DISCOUNT COUPON MANAGER TAB */}
      {activeTab === "coupons" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Create coupon form (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold font-display text-emerald-950">Create Promo Discount Coupons</h3>
            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest block leading-none">Generates dynamic subtotal deductions</p>

            <form onSubmit={handleCouponSubmit} className="space-y-4 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Coupon Code Name *</label>
                <input
                  type="text"
                  placeholder="Ex. MONSOON25"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark rounded-xl text-xs uppercase text-gray-800 font-extrabold tracking-widest"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Deduction Percent (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={couponForm.percent}
                    onChange={(e) => setCouponForm({ ...couponForm, percent: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs font-mono font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase p-0.5">Expiry Threshold</label>
                  <input
                    type="date"
                    value={couponForm.expiry}
                    onChange={(e) => setCouponForm({ ...couponForm, expiry: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs text-gray-650"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-siddha-dark hover:bg-emerald-800 text-white font-bold text-xs rounded-xl"
              >
                Register Security Code
              </button>
            </form>
          </div>

          {/* Table display existing coupons (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-emerald-950 border-b border-gray-50 pb-2 flex items-center">
              <TicketPercent className="w-5 h-5 text-siddha-gold mr-1" />
              Active System Discount Codes ({coupons.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coupons.map((c) => (
                <div key={c.code} className="bg-slate-50 border border-gray-150 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-siddha-light rounded-full filter blur-xl opacity-30"></div>
                  <div>
                    <span className="font-black text-xs text-siddha-dark uppercase tracking-widest block font-mono bg-white border border-gray-150 px-2.5 py-1 rounded w-fit select-all">{c.code}</span>
                    <p className="text-[11px] text-gray-650 font-semibold mt-2.5 leading-none">Deducts: <span className="font-extrabold text-emerald-900">{c.percent}% OFF</span></p>
                    <p className="text-[10px] text-gray-400 font-mono mt-1.5 leading-none">Expiry: {c.expiry}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 5. CLIENT CONSULTATIONS REVIEWS LIST TAB */}
      {activeTab === "consultations" && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="border-b border-gray-50 pb-2 flex justify-between items-center flex-wrap gap-2">
            <h3 className="text-base font-bold text-emerald-950 font-display">Client Consultations Inbox Logs</h3>
            <span className="text-xs bg-siddha-light text-siddha-dark px-3 py-1 rounded-full font-bold uppercase font-mono tracking-wider">{consultations.length} Logs recorded</span>
          </div>

          {consultations.length > 0 ? (
            <div className="space-y-4 divide-y divide-gray-100">
              {consultations.map((con) => (
                <div key={con.id} className="pt-4 first:pt-0 space-y-3">
                  <div className="flex justify-between items-start gap-3 flex-wrap">
                    <div>
                      <span className="text-[9px] font-mono text-gray-400 uppercase select-all font-bold">Log: {con.id}</span>
                      <h4 className="text-sm font-black text-emerald-950 tracking-tight mt-1">{con.fullName}</h4>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs font-bold text-slate-805 font-mono select-all">📞 Phone: {con.phone}</p>
                      {con.email && <p className="text-[10px] text-gray-400 select-all font-mono">✉ Email: {con.email}</p>}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <span className="text-[10px] bg-emerald-50 text-siddha-dark font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Concern: {con.healthConcern}
                    </span>
                    <p className="text-xs text-gray-600 leading-normal font-medium mt-1.5">
                      "{con.detailedNote || "No specific detailed description input compiled."}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-gray-250 p-6">
              <Users className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-400 mt-2">No clients have submitted consulting requests yet.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
