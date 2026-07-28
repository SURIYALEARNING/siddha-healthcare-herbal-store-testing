import { LogOut, Database, LayoutDashboard, ShoppingBag, CalendarClock, TicketPercent, Users, Truck, FolderTree, Images } from "lucide-react";
import { User } from "../../types";
import TabButton from "./TabButton";

export type TabId = "analytics" | "products" | "categories" | "orders" | "coupons" | "consultations" | "shipping" | "carousel";

interface AdminHeaderProps {
  user: User;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onSignOut: () => void;
}

const TABS: { id: TabId; label: string; Icon: typeof LayoutDashboard }[] = [
  { id: "analytics", label: "Stats & Analytics", Icon: LayoutDashboard },
  { id: "products", label: "Product Inventory", Icon: ShoppingBag },
  { id: "categories", label: "Categories", Icon: FolderTree },

  { id: "coupons", label: "Discount Coupons", Icon: TicketPercent },
  { id: "consultations", label: "Doctor Consults", Icon: Users },
  { id: "orders", label: "Live Orders", Icon: CalendarClock },
  { id: "shipping", label: "Shipping & Delivery", Icon: Truck },
  { id: "carousel", label: "Promo Carousel", Icon: Images },
];

export default function AdminHeader({ user, activeTab, onTabChange, onSignOut }: AdminHeaderProps) {
  return (
    <>
      <div className="bg-gradient-to-r from-emerald-950 to-siddha-dark p-6 sm:p-8 rounded-3xl text-white mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-siddha-light rounded-full filter blur-3xl opacity-10"></div>
        <div className="space-y-1.5 z-10">
          <p className="text-[10px] font-bold text-siddha-gold uppercase tracking-widest block">Buyer Console</p>
          <h1 className="text-2xl sm:text-3.5xl font-black font-display tracking-tight">Vanakkam, {user.fullName}!</h1>
          <p className="text-xs text-emerald-200">Manage your custom traditional prescriptions and orders history easily</p>
        </div>
        <button
          onClick={onSignOut}
          className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer z-10 flex items-center space-x-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end border-b border-gray-100 pb-5 gap-4">
        <div className="min-w-0">
          <span className="text-xs font-bold text-red-650 uppercase tracking-widest block mb-1">Clinic Administration Area</span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-emerald-950 tracking-tight leading-tight flex items-center">
            <Database className="w-6 h-6 sm:w-7 sm:h-7 text-siddha-gold mr-2.5 shrink-0" />
            <span>Vaidyar Chief Physician Console</span>
          </h1>
        </div>

        <div className="w-full lg:w-auto max-w-full overflow-x-auto overscroll-x-contain border border-gray-150 p-1.5 rounded-2xl bg-white bg-opacity-70 select-none">
          <div className="flex w-max gap-1">
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              Icon={tab.Icon}
              active={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
            />
          ))}
          </div>
        </div>
      </div>
    </>
  );
}
