import { CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import StatsCard from "./StatsCard";
import type { Product, Order } from "../../types";

interface AnalyticsTabProps {
  products: Product[];
  orders: Order[];
  consultationsCount: number;
}

const PIE_COLORS = ["#14532D", "#D4AF37", "#10B981", "#6EE7B7"];

export default function AnalyticsTab({ products, orders, consultationsCount }: AnalyticsTabProps) {
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalProductsSold = orders.reduce(
    (acc, o) => acc + o.items.reduce((ac2, item) => ac2 + item.quantity, 0),
    0
  );

  const revenueChartData = [
    { name: "Mon", revenue: 850 },
    { name: "Tue", revenue: 1450 },
    { name: "Wed", revenue: 980 },
    { name: "Thu", revenue: 2100 },
    { name: "Fri", revenue: totalRevenue > 2500 ? totalRevenue / 2 : 1850 },
    { name: "Sat", revenue: totalRevenue > 4000 ? totalRevenue / 1.5 : 3200 },
    { name: "Sun", revenue: totalRevenue },
  ];

  const categoryDistributionData = [
    { name: "Immunity Boosters", value: products.filter(p => p.category === "Immunity Boosters").length },
    { name: "Digestive Care", value: products.filter(p => p.category === "Digestive Care").length },
    { name: "Skin Care", value: products.filter(p => p.category === "Skin Care").length },
    { name: "Hair Care", value: products.filter(p => p.category === "Hair Care").length },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <StatsCard
          label="Gross Sales Revenue"
          value={`₹${totalRevenue}`}
          footer="↑ 14.5% versus yesterweek"
        />
        <StatsCard
          label="Remedy Units Handled"
          value={`${totalProductsSold} boxes`}
          footer="Certified packaging dispatched"
          footerColor="text-[#D4AF37]"
        />
        <StatsCard
          label="Doctor Calls Placed"
          value={consultationsCount}
          footer="Pulse assessments registered"
          footerColor="text-rose-500"
        />
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
        <div className="lg:col-span-8 bg-white border border-gray-100 p-6 sm:p-8 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-widest block">Daily Business Profit Graph</h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value) => [`₹${value}`, "Sales Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="#14532D" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-gray-100 p-6 sm:p-8 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-widest block">Therapeutics distribution</h3>
          <div className="w-full h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryDistributionData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {categoryDistributionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val} Formularys`, "Products"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            {categoryDistributionData.map((item, idx) => (
              <div key={item.name} className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="truncate max-w-40 block">{item.name}</span>
                </div>
                <span>{item.value} formulas</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
