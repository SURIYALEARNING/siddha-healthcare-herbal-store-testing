import { Settings, ShoppingBag, MapPin, Heart } from "lucide-react";

export type AccountTab = "dashboard" | "orders" | "addresses" | "wishlist";

interface AccountSidebarProps {
  activeTab: AccountTab;
  onTabChange: (tab: AccountTab) => void;
  ordersCount: number;
  wishlistCount: number;
}

const TABS: { id: AccountTab; label: string; Icon: typeof Settings }[] = [
  { id: "dashboard", label: "Profile Dashboard", Icon: Settings },
  { id: "orders", label: "Orders Timeline", Icon: ShoppingBag },
  { id: "addresses", label: "Shipping Address", Icon: MapPin },
  { id: "wishlist", label: "My Wishlist", Icon: Heart },
];

export default function AccountSidebar({ activeTab, onTabChange, ordersCount, wishlistCount }: AccountSidebarProps) {
  return (
    <div className="lg:col-span-3 bg-white border border-gray-100 p-5 rounded-2xl flex flex-col space-y-1">
      {TABS.map((tab) => {
        const Icon = tab.Icon;
        const count = tab.id === "orders" ? ordersCount : tab.id === "wishlist" ? wishlistCount : null;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-left flex items-center justify-between transition-colors cursor-pointer ${
              isActive ? "bg-siddha-dark text-white" : "text-gray-500 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </div>
            {count !== null && count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                isActive ? "bg-emerald-800 text-white" : "bg-siddha-light text-siddha-dark"
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
