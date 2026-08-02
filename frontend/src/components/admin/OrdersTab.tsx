import { useEffect, useState, useCallback } from "react";
import { getAdminOrdersApi, getOrderStatsApi, getCustomersListApi, getCustomerOrdersApi, adminUpdateOrderStatusApi, getOrderTimelineApi } from "../../api/orders";
import { createRemindersForOrder } from "../../api/reminders";
import { useToastContext } from "../../context/ToastContext";
import type { Order, PaginatedOrders, OrderStats, TimelineEvent, OrderFulfillmentStatus } from "../../types";
import OrderTrackingModal from "./OrderTrackingModal";
import { Eye, Search, X, ArrowLeft, Truck, PackageCheck, Clock, CheckCircle, Ban, PackageSearch } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  Packed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Ready To Ship": "bg-purple-50 text-purple-700 border-purple-200",
  Shipped: "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Out For Delivery": "bg-orange-50 text-orange-700 border-orange-200",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  Returned: "bg-slate-50 text-slate-700 border-slate-200",
  Refunded: "bg-gray-50 text-gray-700 border-gray-200",
};

const FULFILLMENT_STATUSES: OrderFulfillmentStatus[] = [
  "Pending", "Confirmed", "Packed", "Ready To Ship", "Shipped", "Out For Delivery", "Delivered",
  "Cancelled", "Returned", "Refunded",
];

const NEXT_MAP: Record<string, string[]> = {
  Pending: ["Confirmed"],
  Confirmed: ["Packed"],
  Packed: ["Ready To Ship"],
  "Ready To Ship": [],
  Shipped: ["Out For Delivery"],
  "Out For Delivery": [],
  Delivered: [],
  Cancelled: [],
  Returned: [],
  Refunded: [],
};

const TERMINAL = ["Delivered", "Cancelled", "Returned", "Refunded"];

function canShip(status?: string) {
  return ["Packed", "Ready To Ship"].includes(status || "");
}

function canDeliver(status?: string) {
  return ["Shipped", "Out For Delivery"].includes(status || "");
}

function nextOptions(status?: string) {
  const s = status || "";
  if (TERMINAL.includes(s)) return [];
  const opts = [...(NEXT_MAP[s] || [])];
  if (!TERMINAL.includes(s) && s.toLowerCase() !== "cancelled") opts.push("Cancelled");
  return Array.from(new Set(opts));
}

type ViewMode = "orders" | "customers";

export default function OrdersTab() {
  const { showSuccess, showError } = useToastContext();
  const [viewMode, setViewMode] = useState<ViewMode>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderTimeline, setOrderTimeline] = useState<TimelineEvent[]>([]);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [shipOrder, setShipOrder] = useState<Order | null>(null);
  const [deliverOrder, setDeliverOrder] = useState<Order | null>(null);

  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [customerFilter, setCustomerFilter] = useState("");
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const STATUS_CARDS = [
    { key: "today", label: "Today's Orders", icon: Clock },
    { key: "Pending", label: "Pending", icon: Clock },
    { key: "Confirmed", label: "Confirmed", icon: CheckCircle },
    { key: "Packed", label: "Packed", icon: PackageCheck },
    { key: "Ready To Ship", label: "Ready To Ship", icon: Truck },
    { key: "Shipped", label: "Shipped", icon: Truck },
    { key: "Out For Delivery", label: "Out For Delivery", icon: Truck },
    { key: "Delivered", label: "Delivered", icon: CheckCircle },
    { key: "Cancelled", label: "Cancelled", icon: Ban },
    { key: "Returned", label: "Returned", icon: Ban },
    { key: "Refunded", label: "Refunded", icon: Ban },
  ];

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 50 };
      if (filterStatus) params.status = filterStatus;
      if (filterPeriod) params.period = filterPeriod;
      if (searchInput) params.search = searchInput;
      const data: PaginatedOrders = await getAdminOrdersApi(params);
      setOrders(data.orders);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterPeriod, searchInput]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getOrderStatsApi();
      setStats(data);
    } catch {}
  }, []);

  useEffect(() => {
    if (viewMode === "orders") {
      fetchOrders();
      fetchStats();
    }
  }, [fetchOrders, fetchStats, viewMode]);

  useEffect(() => {
    if (viewMode === "customers" && customers.length === 0) {
      setLoadingCustomers(true);
      getCustomersListApi().then(setCustomers).catch(() => {}).finally(() => setLoadingCustomers(false));
    }
  }, [viewMode, customers.length]);

  const handleSearch = () => {
    setPage(1);
    setSearchInput(search);
  };

  const handleStatusFilter = (status: string) => {
    setFilterStatus(filterStatus === status ? "" : status);
    setPage(1);
  };

  const handlePeriodFilter = (period: string) => {
    setFilterPeriod(filterPeriod === period ? "" : period);
    setPage(1);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await adminUpdateOrderStatusApi(orderId, newStatus);
      fetchOrders();
      fetchStats();
    } catch {}
  };

  const handleCreateReminders = async (o: Order) => {
    const orderId = o.id || o._id!;
    try {
      const res = await createRemindersForOrder(orderId);
      showSuccess("Reminder", `Created ${res?.count ?? 0} medicine reminder(s) from the delivered order.`);
      fetchOrders();
      fetchStats();
    } catch (err: any) {
      showError("Reminder Failed", err?.response?.data?.error || "Could not create reminders.");
    }
  };

  const handleViewTimeline = async (order: Order) => {
    setSelectedOrder(order);
    try {
      const data = await getOrderTimelineApi(order.id || order._id!);
      setOrderTimeline(data.timeline);
    } catch {
      setOrderTimeline(order.timeline || []);
    }
    setShowTimelineModal(true);
  };

  const handleViewCustomer = async (customer: any) => {
    setSelectedCustomer(customer);
    setCustomerFilter("");
    try {
      const data = await getCustomerOrdersApi(customer.id);
      setCustomerOrders(data.orders);
    } catch {
      setCustomerOrders([]);
    }
  };

  const handleBackToCustomers = () => {
    setSelectedCustomer(null);
    setCustomerOrders([]);
  };

  const handleCustomerFilterChange = async (status: string) => {
    setCustomerFilter(status);
    if (selectedCustomer) {
      try {
        const data = await getCustomerOrdersApi(selectedCustomer.id, status || undefined);
        setCustomerOrders(data.orders);
      } catch {}
    }
  };

  if (selectedCustomer) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={handleBackToCustomers} className="p-1.5 text-gray-400 hover:text-siddha-dark cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-lg font-bold font-display text-emerald-900">{selectedCustomer.fullName}</h2>
                <p className="text-xs text-gray-400">{selectedCustomer.email} | {selectedCustomer.mobileNumber}</p>
              </div>
            </div>
            <div className="text-right text-xs font-bold text-emerald-700">
              <p>Total Orders: {selectedCustomer.totalOrders}</p>
              <p>Total Spent: ₹{selectedCustomer.totalSpent}</p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {["", ...FULFILLMENT_STATUSES].map((s) => (
              <button
                key={s}
                onClick={() => handleCustomerFilterChange(s)}
                className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                  customerFilter === s
                    ? "bg-siddha-dark text-white border-siddha-dark"
                    : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                }`}
              >
                {s || "All"}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-180">
              <thead>
                <tr className="border-b border-gray-150 text-gray-400 uppercase font-black tracking-widest text-[9px]">
                  <th className="py-2.5">Order</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {customerOrders.map((o) => (
                  <tr key={o.id || o._id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-mono text-siddha-dark font-extrabold text-[10px] max-w-28 truncate select-all">
                      {o.id || o._id}
                    </td>
                    <td className="py-3 text-gray-500 text-[10px]">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="py-3 max-w-48">
                      {o.items.map((item, idx) => (
                        <p key={idx} className="truncate text-gray-500 leading-snug text-[10px]">
                          • {item.name} x{item.quantity}
                        </p>
                      ))}
                    </td>
                    <td className="py-3 font-mono font-bold">₹{o.total}</td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        o.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-block text-[10px] font-bold uppercase py-0.5 px-2 rounded-full border ${STATUS_COLORS[o.currentStatus || o.status] || "bg-gray-50 text-gray-500"}`}>
                        {o.currentStatus || o.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleViewTimeline(o)} className="p-1.5 text-gray-400 hover:text-siddha-dark cursor-pointer" title="Timeline">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {showTimelineModal && selectedOrder && (
          <TimelineModal order={selectedOrder} timeline={orderTimeline} onClose={() => setShowTimelineModal(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {viewMode === "orders" && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {STATUS_CARDS.map((card) => {
            const count = stats[card.key] || 0;
            const isActive = filterStatus === card.key || (filterPeriod === card.key);
            return (
              <button
                key={card.key}
                onClick={() => {
                  if (card.key === "today") handlePeriodFilter("today");
                  else handleStatusFilter(card.key);
                }}
                className={`flex items-center gap-2 p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  isActive
                    ? "bg-siddha-dark text-white border-siddha-dark"
                    : "bg-white text-gray-700 border-gray-100 hover:border-emerald-200 hover:shadow-sm"
                }`}
              >
                <card.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-siddha-gold" : "text-gray-400"}`} />
                <div className="min-w-0">
                  <p className={`text-[16px] font-black leading-none ${isActive ? "text-white" : "text-emerald-950"}`}>{count}</p>
                  <p className={`text-[9px] font-bold uppercase leading-tight truncate ${isActive ? "text-white/70" : "text-gray-400"}`}>{card.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-0.5">
          <button
            onClick={() => { setViewMode("orders"); setSelectedCustomer(null); }}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-colors ${viewMode === "orders" ? "bg-white text-siddha-dark shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Orders
          </button>
          <button
            onClick={() => setViewMode("customers")}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-colors ${viewMode === "customers" ? "bg-white text-siddha-dark shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Customers
          </button>
        </div>

        {viewMode === "orders" && (
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by name, email, phone, order ID..."
                className="w-full pl-8 pr-3 py-1.5 border border-gray-150 rounded-xl text-[11px] font-medium focus:outline-none focus:border-siddha-dark"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {searchInput && (
              <button onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }} className="p-1.5 text-gray-400 hover:text-rose-500 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {viewMode === "orders" && (
        <>
          <div className="flex gap-1.5 flex-wrap">
            {["", "today", "yesterday", "last7", "thisMonth"].map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodFilter(p)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                  filterPeriod === p
                    ? "bg-siddha-dark text-white border-siddha-dark"
                    : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                }`}
              >
                {p ? { today: "Today", yesterday: "Yesterday", last7: "Last 7 Days", thisMonth: "This Month" }[p] : "All Time"}
              </button>
            ))}
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-siddha-dark border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No orders found.</p>
            ) : (
              <>
                <table className="w-full text-xs text-left min-w-200">
                  <thead>
                    <tr className="border-b border-gray-150 text-gray-400 uppercase font-black tracking-widest text-[9px]">
                      <th className="py-2.5">Order</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Shipping</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                    {orders.map((o) => (
                      <tr key={o.id || o._id} className="hover:bg-gray-50/50">
                        <td className="py-3 font-mono text-siddha-dark font-extrabold text-[10px] max-w-20 truncate select-all">
                          {(o.id || o._id || "").slice(-8)}
                        </td>
                        <td className="py-3 text-gray-500 text-[10px] whitespace-nowrap">
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-"}
                        </td>
                        <td className="py-3 font-bold text-gray-800 max-w-28 truncate">{o.fullName}</td>
                        <td className="py-3 font-mono text-[10px] text-gray-500">{o.mobileNumber}</td>
                        <td className="py-3 max-w-40">
                          {o.items.map((item, idx) => (
                            <p key={idx} className="truncate text-gray-500 leading-snug text-[10px]">
                              • {item.name} <span className="font-mono font-bold">x{item.quantity}</span>
                            </p>
                          ))}
                        </td>
                        <td className="py-3 font-mono font-bold text-emerald-950 whitespace-nowrap">₹{o.total}</td>
                        <td className="py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            o.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">
                            {o.shippingMethod || "MANUAL"}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-block text-[10px] font-bold uppercase py-0.5 px-2 rounded-full border ${STATUS_COLORS[o.currentStatus || o.status] || "bg-gray-50 text-gray-500"}`}>
                            {o.currentStatus || o.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => handleViewTimeline(o)} className="p-1.5 text-gray-400 hover:text-siddha-dark cursor-pointer" title="Timeline">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setTrackingOrder(o)} className="p-1.5 text-gray-400 hover:text-siddha-dark cursor-pointer" title="Manage Tracking">
                              <PackageSearch className="w-3.5 h-3.5" />
                            </button>
                            {(!o.shippingMethod || o.shippingMethod === "MANUAL") && (
                              <div className="flex items-center justify-end gap-1">
                                {canShip(o.currentStatus || o.status) && (
                                  <button
                                    onClick={() => setShipOrder(o)}
                                    title="Ship Order"
                                    className="px-2 py-1 text-[10px] font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer whitespace-nowrap"
                                  >
                                    Ship Order
                                  </button>
                                )}
                                {canDeliver(o.currentStatus || o.status) && (
                                  <button
                                    onClick={() => setDeliverOrder(o)}
                                    title="Mark Delivered"
                                    className="px-2 py-1 text-[10px] font-bold rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 cursor-pointer whitespace-nowrap"
                                  >
                                    Mark Delivered
                                  </button>
                                )}
                                {nextOptions(o.currentStatus || o.status).length > 0 && (
                                  <select
                                    defaultValue=""
                                    onChange={(e) => { if (e.target.value) handleUpdateStatus(o.id || o._id!, e.target.value); }}
                                    className="p-1 border border-gray-150 bg-gray-50 text-[10px] font-bold rounded-lg cursor-pointer max-w-28 focus:outline-none"
                                  >
                                    <option value="" disabled>Update…</option>
                                    {nextOptions(o.currentStatus || o.status).map((s) => (
                                      <option key={s} value={s}>{s}</option>
                                    ))}
                                  </select>
                                )}
                                {(o.currentStatus || o.status) === "Delivered" && (
                                  <button
                                    onClick={() => handleCreateReminders(o)}
                                    title="Create medicine reminder from this delivered order"
                                    className="px-2 py-1 text-[10px] font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 cursor-pointer whitespace-nowrap"
                                  >
                                    Create Reminder
                                  </button>
                                )}
                              </div>
                            )}
                            {o.shippingMethod === "SHIPROCKET" && (
                              <span className="text-[9px] text-gray-400 italic py-1">Auto-track</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="px-3 py-1 text-[10px] font-bold border border-gray-150 rounded-lg disabled:opacity-30 cursor-pointer disabled:cursor-default"
                    >
                      Previous
                    </button>
                    <span className="text-[10px] text-gray-500 font-bold">
                      Page {page} of {totalPages} ({total} total)
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="px-3 py-1 text-[10px] font-bold border border-gray-150 rounded-lg disabled:opacity-30 cursor-pointer disabled:cursor-default"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {viewMode === "customers" && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 overflow-x-auto">
          {loadingCustomers ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-siddha-dark border-t-transparent rounded-full animate-spin" />
            </div>
          ) : customers.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No customers found.</p>
          ) : (
            <table className="w-full text-xs text-left min-w-150">
              <thead>
                <tr className="border-b border-gray-150 text-gray-400 uppercase font-black tracking-widest text-[9px]">
                  <th className="py-2.5">Customer</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Last Order</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => handleViewCustomer(c)}>
                    <td className="py-3 font-bold text-gray-800">{c.fullName}</td>
                    <td className="py-3 font-mono text-[10px] text-gray-500">{c.mobileNumber}</td>
                    <td className="py-3 text-gray-500 text-[10px]">{c.email}</td>
                    <td className="py-3 font-bold">{c.totalOrders}</td>
                    <td className="py-3 font-mono font-bold text-emerald-950">₹{c.totalSpent}</td>
                    <td className="py-3 text-gray-500 text-[10px]">
                      {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="py-3 text-right">
                      <button className="p-1.5 text-gray-400 hover:text-siddha-dark cursor-pointer" title="View Orders">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showTimelineModal && selectedOrder && (
        <TimelineModal order={selectedOrder} timeline={orderTimeline} onClose={() => setShowTimelineModal(false)} />
      )}
      {trackingOrder && (
        <OrderTrackingModal
          order={trackingOrder}
          intent="MANAGE"
          onClose={() => setTrackingOrder(null)}
          onSaved={() => { fetchOrders(); fetchStats(); }}
        />
      )}
      {shipOrder && (
        <OrderTrackingModal
          order={shipOrder}
          intent="SHIP"
          onClose={() => setShipOrder(null)}
          onSaved={() => { fetchOrders(); fetchStats(); }}
        />
      )}
      {deliverOrder && (
        <OrderTrackingModal
          order={deliverOrder}
          intent="DELIVER"
          onClose={() => setDeliverOrder(null)}
          onSaved={() => { fetchOrders(); fetchStats(); }}
        />
      )}
    </div>
  );
}

function TimelineModal({ order, timeline, onClose }: { order: Order; timeline: TimelineEvent[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 sm:p-8 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-display text-emerald-900">Order Timeline</h3>
            <p className="text-[10px] font-mono text-gray-400 mt-0.5">#{order.id || order._id}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-2xl text-[10px]">
          <div><span className="font-bold text-gray-400">Status:</span> <span className="font-bold">{order.currentStatus || order.status}</span></div>
          <div><span className="font-bold text-gray-400">Shipping:</span> {order.shippingMethod || "MANUAL"}</div>
          <div><span className="font-bold text-gray-400">Payment:</span> {order.paymentStatus}</div>
          <div><span className="font-bold text-gray-400">Total:</span> ₹{order.total}</div>
          {order.tracking?.courierName && <div><span className="font-bold text-gray-400">Courier:</span> {order.tracking.courierName}</div>}
          {order.tracking?.awbNumber && <div><span className="font-bold text-gray-400">AWB:</span> <span className="font-mono">{order.tracking.awbNumber}</span></div>}
          {order.packedAt && <div><span className="font-bold text-gray-400">Packed:</span> {new Date(order.packedAt).toLocaleString()}</div>}
          {order.tracking?.shippedAt && <div><span className="font-bold text-gray-400">Shipped:</span> {new Date(order.tracking.shippedAt).toLocaleString()}</div>}
          {order.deliveredAt && <div><span className="font-bold text-gray-400">Delivered:</span> {new Date(order.deliveredAt).toLocaleString()}</div>}
        </div>

        <div className="relative pl-6 space-y-0">
          {timeline.length === 0 ? (
            <p className="text-center text-gray-400 text-xs py-4">No timeline events available.</p>
          ) : (
            [...timeline].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((event, idx) => (
              <div key={idx} className="relative pb-5 last:pb-0">
                {idx < timeline.length - 1 && (
                  <div className="absolute left-[-14px] top-3 bottom-0 w-0.5 bg-emerald-200" />
                )}
                <div className="absolute left-[-18px] top-1.5 w-3 h-3 rounded-full border-2 border-emerald-500 bg-white" />
                <div>
                  <p className="text-xs font-bold text-gray-800">{event.title}</p>
                  {event.description && <p className="text-[10px] text-gray-400 mt-0.5">{event.description}</p>}
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-gray-400">
                      {new Date(event.createdAt).toLocaleString()}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      event.source === "SHIPROCKET" ? "bg-blue-50 text-blue-600" :
                      event.source === "STAFF" ? "bg-amber-50 text-amber-600" :
                      "bg-gray-50 text-gray-500"
                    }`}>
                      {event.source}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
