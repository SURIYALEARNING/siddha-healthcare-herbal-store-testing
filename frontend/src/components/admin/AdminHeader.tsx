import { Database, LogOut } from "lucide-react";
import { User } from "../../types";

export type TabId = "analytics" | "products" | "categories" | "orders" | "coupons" | "consultations" | "shipping" | "shippingManagement" | "carousel" | "batches" | "reminders" | "reviews" | "staffManagement" | "customers" | "blogs";

interface AdminHeaderProps {
  user: User;
  onSignOut: () => void;
}

export default function AdminHeader({ user, onSignOut }: AdminHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-emerald-950 to-siddha-dark p-6 sm:p-8 rounded-3xl text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden shadow-md">
      <div className="absolute top-0 right-0 w-32 h-32 bg-siddha-light rounded-full filter blur-3xl opacity-10"></div>
      <div className="space-y-1.5 z-10">
        <p className="text-[10px] font-bold text-siddha-gold uppercase tracking-widest block">Buyer Console</p>
        <h1 className="text-2xl sm:text-3.5xl font-black font-display tracking-tight">Vanakkam, {user.fullName}!</h1>
        <p className="text-xs text-emerald-200">Manage your custom traditional prescriptions and orders history easily</p>
      </div>
      <div className="flex items-center gap-4 z-10">
        <div className="hidden sm:flex items-center gap-2 text-white/60 text-[10px] uppercase tracking-widest font-bold">
          <Database className="w-4 h-4 text-siddha-gold" />
          <span>Vaidyar Chief Physician Console</span>
        </div>
        <button
          onClick={onSignOut}
          className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
