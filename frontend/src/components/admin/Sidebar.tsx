import { useState } from "react";
import {
  LayoutDashboard, ShoppingBag, FolderTree, TicketPercent, Users,
  CalendarClock, Truck, Images, Package, BellRing, MessageSquare, Shield, LogOut,
  Pin, PinOff,
} from "lucide-react";
import type { User, PermissionKey } from "../../types";
import type { TabId } from "./AdminHeader";

const ALL_TABS: { id: TabId; label: string; Icon: typeof LayoutDashboard; permission?: PermissionKey }[] = [
  { id: "analytics", label: "Stats & Analytics", Icon: LayoutDashboard, permission: "dashboard" },
  { id: "products", label: "Product Inventory", Icon: ShoppingBag, permission: "products" },
  { id: "categories", label: "Categories", Icon: FolderTree, permission: "categories" },
  { id: "coupons", label: "Discount Coupons", Icon: TicketPercent, permission: "coupons" },
  { id: "consultations", label: "Doctor Consults", Icon: Users, permission: "consultations" },
  { id: "orders", label: "Live Orders", Icon: CalendarClock, permission: "orders" },
  { id: "shipping", label: "Shipping & Delivery", Icon: Truck, permission: "shipping" },
  { id: "carousel", label: "Promo Carousel", Icon: Images, permission: "carousel" },
  { id: "batches", label: "Batch Management", Icon: Package, permission: "batches" },
  { id: "reminders", label: "Medicine Reminders", Icon: BellRing, permission: "reminders" },
  { id: "reviews", label: "Reviews", Icon: MessageSquare, permission: "reviews" },
  { id: "staffManagement", label: "Staff Management", Icon: Shield, permission: "staffManagement" },
];

interface SidebarProps {
  user: User;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onSignOut: () => void;
}

export default function Sidebar({ user, activeTab, onTabChange, onSignOut }: SidebarProps) {
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  const visibleTabs = ALL_TABS.filter((tab) => {
    if (isSuperAdmin) return true;
    if (!tab.permission) return false;
    return user.permissions?.[tab.permission] === true;
  });
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);

  const expanded = pinned || hovered;

  return (
    <nav
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`fixed left-0 top-0 h-full z-40 flex flex-col bg-gradient-to-b from-emerald-950 to-siddha-dark transition-all duration-200 ease-in-out shadow-xl ${
        expanded ? "w-56" : "w-16"
      }`}
    >
      {/* Logo / Brand */}
      <div className={`flex items-center ${expanded ? "justify-between px-4" : "justify-center"} h-16 border-b border-white/10 shrink-0`}>
        {expanded ? (
          <>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-siddha-gold flex items-center justify-center text-siddha-dark font-black text-xs">SH</div>
              <span className="text-white text-xs font-bold uppercase tracking-widest">Siddha</span>
            </div>
            <button
              onClick={() => setPinned(!pinned)}
              className="text-white/50 hover:text-siddha-gold transition-colors cursor-pointer"
              title={pinned ? "Unpin sidebar" : "Pin sidebar"}
            >
              {pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            </button>
          </>
        ) : (
          <button
            onClick={() => setPinned(!pinned)}
            className="text-white/50 hover:text-siddha-gold transition-colors cursor-pointer"
            title={pinned ? "Unpin sidebar" : "Pin sidebar"}
          >
            {pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                expanded ? "justify-start" : "justify-center"
              } ${
                isActive
                  ? "bg-siddha-gold/20 text-siddha-gold shadow-sm"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
              title={tab.label}
            >
              <tab.Icon className={`shrink-0 ${expanded ? "w-4 h-4" : "w-5 h-5"}`} />
              {expanded && <span className="truncate">{tab.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Sign Out */}
      <div className="border-t border-white/10 px-2 py-3">
        <button
          onClick={onSignOut}
          className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            expanded ? "justify-start" : "justify-center"
          } text-rose-300/60 hover:bg-rose-500/10 hover:text-rose-300`}
          title="Sign Out"
        >
          <LogOut className={`shrink-0 ${expanded ? "w-4 h-4" : "w-5 h-5"}`} />
          {expanded && <span>Sign Out</span>}
        </button>
      </div>
    </nav>
  );
}
