import { useEffect, useState, useCallback, useMemo } from "react";
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package,
  Clock, CheckCircle, XCircle, AlertTriangle, Activity as ActivityIcon,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import StatsCard from "./StatsCard";
import { Spinner } from "../ui/Spinner";
import * as dashboardApi from "../../api/dashboard";
import type {
  OverviewData, RevenueData, OrderAnalytics, CustomerAnalytics,
  ProductAnalytics, CategoryAnalytics, InventoryAnalytics, BatchAnalytics,
  ReminderAnalytics, ReviewAnalytics, PaymentAnalytics, ShippingAnalytics,
  StaffAnalytics, Activity, Notification, User,
} from "../../types";

const PIE_COLORS = ["#14532D", "#D4AF37", "#10B981", "#6EE7B7", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const DATE_PRESETS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "last7" },
  { label: "Last 30 Days", value: "last30" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "Last 3 Months", value: "last3" },
  { label: "Last 6 Months", value: "last6" },
  { label: "This Year", value: "thisYear" },
  { label: "Last Year", value: "lastYear" },
  { label: "Custom", value: "custom" },
];

function computeDateRange(preset: string): { startDate?: string; endDate?: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  switch (preset) {
    case "today": {
      const s = new Date(now); s.setHours(0, 0, 0, 0);
      return { startDate: s.toISOString(), endDate: now.toISOString() };
    }
    case "yesterday": {
      const s = new Date(now); s.setDate(s.getDate() - 1); s.setHours(0, 0, 0, 0);
      const e = new Date(now); e.setDate(e.getDate() - 1); e.setHours(23, 59, 59, 999);
      return { startDate: s.toISOString(), endDate: e.toISOString() };
    }
    case "last7": {
      const s = new Date(now); s.setDate(s.getDate() - 7);
      return { startDate: s.toISOString(), endDate: now.toISOString() };
    }
    case "last30": {
      const s = new Date(now); s.setDate(s.getDate() - 30);
      return { startDate: s.toISOString(), endDate: now.toISOString() };
    }
    case "thisMonth":
      return { startDate: new Date(y, m, 1).toISOString(), endDate: now.toISOString() };
    case "lastMonth":
      return { startDate: new Date(y, m - 1, 1).toISOString(), endDate: new Date(y, m, 0, 23, 59, 59, 999).toISOString() };
    case "last3": {
      const s = new Date(now); s.setMonth(s.getMonth() - 3);
      return { startDate: s.toISOString(), endDate: now.toISOString() };
    }
    case "last6": {
      const s = new Date(now); s.setMonth(s.getMonth() - 6);
      return { startDate: s.toISOString(), endDate: now.toISOString() };
    }
    case "thisYear":
      return { startDate: new Date(y, 0, 1).toISOString(), endDate: now.toISOString() };
    case "lastYear":
      return { startDate: new Date(y - 1, 0, 1).toISOString(), endDate: new Date(y - 1, 11, 31, 23, 59, 59, 999).toISOString() };
    default: return {};
  }
}

interface AnalyticsTabProps {
  user: User;
}

export default function AnalyticsTab({ user }: AnalyticsTabProps) {
  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const has = useCallback((perm: string) => isSuperAdmin || (user.permissions as any)?.[perm] === true, [isSuperAdmin, user.permissions]);

  const [preset, setPreset] = useState("last30");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const dateRange = useMemo(() => {
    if (preset === "custom") return { startDate: customStart || undefined, endDate: customEnd || undefined };
    return computeDateRange(preset);
  }, [preset, customStart, customEnd]);

  const { startDate, endDate } = dateRange;

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [orders, setOrders] = useState<OrderAnalytics | null>(null);
  const [customers, setCustomers] = useState<CustomerAnalytics | null>(null);
  const [products, setProducts] = useState<ProductAnalytics | null>(null);
  const [categories, setCategories] = useState<CategoryAnalytics | null>(null);
  const [inventory, setInventory] = useState<InventoryAnalytics | null>(null);
  const [batches, setBatches] = useState<BatchAnalytics | null>(null);
  const [reminders, setReminders] = useState<ReminderAnalytics | null>(null);
  const [reviews, setReviews] = useState<ReviewAnalytics | null>(null);
  const [payments, setPayments] = useState<PaymentAnalytics | null>(null);
  const [shipping, setShipping] = useState<ShippingAnalytics | null>(null);
  const [staff, setStaff] = useState<StaffAnalytics | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = { startDate, endDate };
      const results = await Promise.allSettled([
        dashboardApi.fetchOverview(startDate, endDate),
        has("dashboard") ? dashboardApi.fetchRevenueAnalytics(startDate, endDate) : Promise.resolve(null),
        has("dashboard") ? dashboardApi.fetchOrderAnalytics(startDate, endDate) : Promise.resolve(null),
        has("dashboard") ? dashboardApi.fetchCustomerAnalytics(startDate, endDate) : Promise.resolve(null),
        has("products") ? dashboardApi.fetchProductAnalytics(startDate, endDate) : Promise.resolve(null),
        has("categories") ? dashboardApi.fetchCategoryAnalytics(startDate, endDate) : Promise.resolve(null),
        dashboardApi.fetchInventoryAnalytics(),
        has("batches") ? dashboardApi.fetchBatchAnalytics() : Promise.resolve(null),
        has("reminders") ? dashboardApi.fetchReminderAnalytics(startDate, endDate) : Promise.resolve(null),
        has("reviews") ? dashboardApi.fetchReviewAnalytics(startDate, endDate) : Promise.resolve(null),
        dashboardApi.fetchPaymentAnalytics(startDate, endDate),
        has("shipping") ? dashboardApi.fetchShippingAnalytics(startDate, endDate) : Promise.resolve(null),
        has("staffManagement") ? dashboardApi.fetchStaffAnalytics() : Promise.resolve(null),
        dashboardApi.fetchRecentActivities(),
        dashboardApi.fetchNotifications(),
      ]);
      const v = (r: PromiseSettledResult<any>) => r.status === "fulfilled" ? r.value : null;
      setOverview(v(results[0]));
      setRevenue(v(results[1]));
      setOrders(v(results[2]));
      setCustomers(v(results[3]));
      setProducts(v(results[4]));
      setCategories(v(results[5]));
      setInventory(v(results[6]));
      setBatches(v(results[7]));
      setReminders(v(results[8]));
      setReviews(v(results[9]));
      setPayments(v(results[10]));
      setShipping(v(results[11]));
      setStaff(v(results[12]));
      setActivities(v(results[13]) || []);
      setNotifications(v(results[14]) || []);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, has]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const fmt = (n: number) => n?.toLocaleString("en-IN") || "0";
  const fmtCurr = (n: number) => `₹${fmt(Math.round(n))}`;
  const grow = (v: number) => v > 0 ? { color: "text-emerald-600", icon: TrendingUp } : v < 0 ? { color: "text-rose-600", icon: TrendingDown } : { color: "text-gray-400", icon: ActivityIcon };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-8">
      {/* Date Filter */}
      <div className="bg-white border border-gray-100 rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date Range</span>
        <div className="flex flex-wrap gap-1.5">
          {DATE_PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPreset(p.value)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                preset === p.value ? "bg-siddha-dark text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <div className="flex gap-2 items-center ml-2">
            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)}
              className="p-1.5 border border-gray-150 rounded-lg text-xs" />
            <span className="text-xs text-gray-400">to</span>
            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)}
              className="p-1.5 border border-gray-150 rounded-lg text-xs" />
          </div>
        )}
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((n, i) => (
            <div key={i} className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              n.severity === "error" ? "bg-red-50 text-red-700 border border-red-100" :
              n.severity === "warning" ? "bg-amber-50 text-amber-700 border border-amber-100" :
              "bg-blue-50 text-blue-700 border border-blue-100"
            }`}>
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {n.message}
            </div>
          ))}
        </div>
      )}

      {/* 1. Business Overview */}
      {overview && (
        <div>
          <h2 className="text-lg font-bold font-display text-emerald-900 mb-4">Business Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <StatsCard label="Total Revenue" value={fmtCurr(overview.totalRevenue)}
              footer={`${overview.growth.revenue >= 0 ? "+" : ""}${overview.growth.revenue}% vs prev`}
              footerColor={grow(overview.growth.revenue).color} />
            <StatsCard label="Total Orders" value={fmt(overview.totalOrders)}
              footer={`${overview.growth.orders >= 0 ? "+" : ""}${overview.growth.orders}% vs prev`}
              footerColor={grow(overview.growth.orders).color} />
            <StatsCard label="Customers" value={fmt(overview.totalCustomers)} footer="All time" />
            <StatsCard label="Products" value={fmt(overview.totalProducts)} footer={`${overview.totalCategories} categories`} />
            <StatsCard label="Avg Order Value" value={fmtCurr(overview.averageOrderValue)}
              footer={`${overview.growth.avgOrderValue >= 0 ? "+" : ""}${overview.growth.avgOrderValue}% vs prev`}
              footerColor={grow(overview.growth.avgOrderValue).color} />
            <StatsCard label="Today Revenue" value={fmtCurr(overview.todayRevenue)} footer={`${overview.todayOrders} orders today`} />
            <StatsCard label="Pending Orders" value={fmt(overview.pendingOrders)} footer="Awaiting processing" footerColor="text-amber-600" />
            <StatsCard label="Delivered" value={fmt(overview.deliveredOrders)} footer="Completed orders" footerColor="text-emerald-600" />
            <StatsCard label="Cancelled" value={fmt(overview.cancelledOrders)} footer="Cancelled orders" footerColor="text-rose-600" />
            <StatsCard label="Low Stock" value={fmt(overview.lowStockProducts)} footer="Products running low" footerColor="text-amber-600" />
            <StatsCard label="Out of Stock" value={fmt(overview.outOfStockProducts)} footer="Needs restock" footerColor="text-rose-600" />
            <StatsCard label="Pending Reviews" value={fmt(overview.pendingReviews)} footer="Awaiting approval" footerColor="text-blue-600" />
          </div>
        </div>
      )}

      {/* 2. Revenue Analytics */}
      {revenue && has("dashboard") && (
        <Section title="Revenue Analytics">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <StatsCard label="Gross Revenue" value={fmtCurr(revenue.grossRevenue)} footer="Before discounts" />
            <StatsCard label="Discounts" value={fmtCurr(revenue.discountAmount)} footer="Coupon discounts" footerColor="text-rose-600" />
            <StatsCard label="Net Revenue" value={fmtCurr(revenue.netRevenue)} footer="After discounts" footerColor="text-emerald-600" />
          </div>
          <Chart title="Daily Revenue Trend">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenue.dailyRevenue}>
                <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#14532D" stopOpacity={0.2}/><stop offset="95%" stopColor="#14532D" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                <Tooltip formatter={(v: any) => [fmtCurr(v), "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#14532D" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Chart>
        </Section>
      )}

      {/* 3. Order Analytics */}
      {orders && has("dashboard") && (
        <Section title="Order Analytics">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <StatsCard label="Total Orders" value={fmt(orders.totalOrders)} footer="" />
            <StatsCard label="Completed" value={fmt(orders.completedOrders)} footerColor="text-emerald-600" />
            <StatsCard label="Pending" value={fmt(orders.pendingOrders)} footerColor="text-amber-600" />
            <StatsCard label="Cancelled" value={fmt(orders.cancelledOrders)} footerColor="text-rose-600" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Chart title="Orders by Day">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={orders.ordersByDay}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#14532D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Chart>
            <Chart title="Order Status">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={orders.orderStatusChart} innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {orders.orderStatusChart.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </Chart>
          </div>
        </Section>
      )}

      {/* 4. Customer Analytics */}
      {customers && has("dashboard") && (
        <Section title="Customer Analytics">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
            <StatsCard label="Total Customers" value={fmt(customers.totalCustomers)} footer="" />
            <StatsCard label="New" value={fmt(customers.newCustomers)} footer="In this period" footerColor="text-emerald-600" />
            <StatsCard label="Returning" value={fmt(customers.returningCustomers)} footer="Repeat buyers" footerColor="text-blue-600" />
            <StatsCard label="Repeat Rate" value={`${customers.repeatPurchaseRate}%`} footer="Purchase again" />
            <StatsCard label="Avg LTV" value={fmtCurr(customers.customerLifetimeValue)} footer="Per customer" />
          </div>
          {customers.topCustomers.length > 0 && (
            <div className="mt-4">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Top Customers</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead><tr className="border-b text-gray-400 uppercase font-bold text-[9px]">
                    <th className="py-2 pr-3">Name</th><th className="py-2 pr-3">Email</th><th className="py-2 pr-3">Orders</th><th className="py-2 pr-3">Spent</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {customers.topCustomers.map((c) => (
                      <tr key={c.id}>
                        <td className="py-2 pr-3 font-semibold">{c.fullName}</td>
                        <td className="py-2 pr-3 text-gray-500">{c.email}</td>
                        <td className="py-2 pr-3">{c.totalOrders}</td>
                        <td className="py-2 pr-3 font-mono">{fmtCurr(c.totalSpent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Section>
      )}

      {/* 5. Product Analytics */}
      {products && has("products") && (
        <Section title="Product Analytics">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <StatsCard label="Total Products" value={fmt(products.totalProducts)} footer="" />
            <StatsCard label="Products Sold" value={fmt(products.productsWithSales)} footer="Have sales" footerColor="text-emerald-600" />
            <StatsCard label="Never Sold" value={fmt(products.productsNeverSold)} footer="Dead stock" footerColor="text-rose-600" />
          </div>
          {products.topSelling.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Top Selling Products</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead><tr className="border-b text-gray-400 uppercase font-bold text-[9px]">
                    <th className="py-2 pr-3">Product</th><th className="py-2 pr-3">Orders</th><th className="py-2 pr-3">Qty Sold</th><th className="py-2 pr-3">Revenue</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.topSelling.map((p: any, i: number) => (
                      <tr key={i}>
                        <td className="py-2 pr-3 font-semibold truncate max-w-[200px]">{p.name}</td>
                        <td className="py-2 pr-3">{p.orders}</td>
                        <td className="py-2 pr-3">{p.quantitySold}</td>
                        <td className="py-2 pr-3 font-mono">{fmtCurr(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Section>
      )}

      {/* 6. Category Analytics */}
      {categories && has("categories") && (
        <Section title="Category Analytics">
          <div className="grid grid-cols-2 gap-6">
            <Chart title="Revenue by Category">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={categories.categories} dataKey="revenue" nameKey="name" outerRadius={80} label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                    {categories.categories.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => fmtCurr(v)} />
                </PieChart>
              </ResponsiveContainer>
            </Chart>
            <div className="space-y-2">
              {categories.categories.slice(0, 8).map((c, i) => (
                <div key={c.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="font-semibold">{c.name}</span>
                  </div>
                  <span className="font-mono">{fmtCurr(c.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* 7. Inventory */}
      {inventory && (
        <Section title="Inventory Analytics">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatsCard label="Total Stock" value={fmt(inventory.totalStockQuantity)} footer="Units in stock" />
            <StatsCard label="Total Produced" value={fmt(inventory.totalProduced)} footer="All time" />
            <StatsCard label="Total Sold" value={fmt(inventory.totalSold)} footer="Units sold" footerColor="text-emerald-600" />
            <StatsCard label="Low Stock" value={fmt(inventory.lowStockCount)} footer="Needs attention" footerColor="text-amber-600" />
            <StatsCard label="Out of Stock" value={fmt(inventory.outOfStockCount)} footer="Restock needed" footerColor="text-rose-600" />
          </div>
        </Section>
      )}

      {/* 8. Batch Analytics */}
      {batches && has("batches") && (
        <Section title="Batch Analytics">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <StatsCard label="Active" value={fmt(batches.activeBatches)} footerColor="text-emerald-600" />
            <StatsCard label="Out of Stock" value={fmt(batches.outOfStockBatches)} footerColor="text-rose-600" />
            <StatsCard label="Expired" value={fmt(batches.expiredBatches)} footerColor="text-gray-500" />
            <StatsCard label="On Hold" value={fmt(batches.holdBatches)} footerColor="text-amber-600" />
          </div>
          <Chart title="Batch Status">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={batches.statusChart} dataKey="value" nameKey="name" outerRadius={70} label>
                  {batches.statusChart.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Chart>
        </Section>
      )}

      {/* 9. Reminder Analytics */}
      {reminders && has("reminders") && (
        <Section title="Medicine Reminder Analytics">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <StatsCard label="Today" value={fmt(reminders.todayReminders)} footerColor="text-amber-600" />
            <StatsCard label="Pending" value={fmt(reminders.pendingReminders)} footerColor="text-amber-600" />
            <StatsCard label="WhatsApp Sent" value={fmt(reminders.whatsappSent)} footerColor="text-blue-600" />
            <StatsCard label="Call Completed" value={fmt(reminders.callCompleted)} footerColor="text-emerald-600" />
            <StatsCard label="Purchased Again" value={fmt(reminders.purchasedAgain)} footer="Conversion" footerColor="text-emerald-600" />
            <StatsCard label="Conversion Rate" value={`${reminders.conversionRate}%`} footer="of total reminders" />
            <StatsCard label="Not Interested" value={fmt(reminders.notInterested)} footerColor="text-gray-500" />
            <StatsCard label="No Response" value={fmt(reminders.noResponse)} footerColor="text-rose-600" />
          </div>
        </Section>
      )}

      {/* 10. Review Analytics */}
      {reviews && has("reviews") && (
        <Section title="Review Analytics">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <StatsCard label="Total Reviews" value={fmt(reviews.totalReviews)} footer="" />
            <StatsCard label="Approved" value={fmt(reviews.approvedReviews)} footerColor="text-emerald-600" />
            <StatsCard label="Pending" value={fmt(reviews.pendingReviews)} footer="Awaiting approval" footerColor="text-amber-600" />
            <StatsCard label="Avg Rating" value={reviews.averageRating} footer="out of 5" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Chart title="Rating Distribution">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={reviews.ratingChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="rating" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Chart>
            <Chart title="Review Trend">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={reviews.reviewTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#14532D" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Chart>
          </div>
        </Section>
      )}

      {/* 11. Payment Analytics */}
      {payments && (
        <Section title="Payment Analytics">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <StatsCard label="Successful" value={fmt(payments.successfulPayments)} footerColor="text-emerald-600" />
            <StatsCard label="Failed" value={fmt(payments.failedPayments)} footerColor="text-rose-600" />
            <StatsCard label="Refund Amount" value={fmtCurr(payments.refundAmount)} footer="" />
          </div>
          <Chart title="Payment Methods">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={payments.paymentMethodChart} dataKey="value" nameKey="name" outerRadius={70} label>
                  {payments.paymentMethodChart.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Chart>
        </Section>
      )}

      {/* 12. Shipping Analytics */}
      {shipping && has("shipping") && (
        <Section title="Shipping Analytics">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatsCard label="Delivered" value={fmt(shipping.deliveredOrders)} footerColor="text-emerald-600" />
            <StatsCard label="In Transit" value={fmt(shipping.inTransitOrders)} footerColor="text-blue-600" />
            <StatsCard label="RTO" value={fmt(shipping.rtoOrders)} footerColor="text-rose-600" />
            <StatsCard label="Cancelled" value={fmt(shipping.cancelledShipments)} footerColor="text-gray-500" />
          </div>
        </Section>
      )}

      {/* 13. Staff Analytics */}
      {staff && has("staffManagement") && (
        <Section title="Staff Analytics">
          <div className="grid grid-cols-2 gap-4">
            <StatsCard label="Total Staff" value={fmt(staff.totalStaff)} footer="" />
            <StatsCard label="Active Staff" value={fmt(staff.activeStaff)} footerColor="text-emerald-600" />
          </div>
        </Section>
      )}

      {/* Recent Activities */}
      {activities.length > 0 && (
        <Section title="Recent Activities">
          <div className="space-y-2">
            {activities.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl text-xs">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  a.type === "order" ? "bg-blue-100 text-blue-700" :
                  a.type === "customer" ? "bg-emerald-100 text-emerald-700" :
                  a.type === "review" ? "bg-amber-100 text-amber-700" :
                  "bg-purple-100 text-purple-700"
                }`}>
                  {a.type === "order" ? <ShoppingCart className="w-3.5 h-3.5" /> :
                   a.type === "customer" ? <Users className="w-3.5 h-3.5" /> :
                   a.type === "review" ? <ActivityIcon className="w-3.5 h-3.5" /> :
                   <Package className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-700">{a.message}</p>
                  <p className="text-gray-400">{a.detail}</p>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">{new Date(a.time).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4">
      <h3 className="text-sm font-bold font-display text-emerald-900">{title}</h3>
      {children}
    </div>
  );
}

function Chart({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{title}</h4>
      {children}
    </div>
  );
}
