import { LucideIcon } from "lucide-react";

interface TabButtonProps {
  id: string;
  label: string;
  Icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}

export default function TabButton({ id, label, Icon, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-1 px-4 py-2.5 rounded-xl text-xs font-bold uppercase cursor-pointer whitespace-nowrap transition-colors ${
        active
          ? "bg-siddha-dark text-white shadow-xs"
          : "text-gray-500 hover:bg-slate-50 hover:text-siddha-dark"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
