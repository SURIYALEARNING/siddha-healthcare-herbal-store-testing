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
      className={`flex shrink-0 items-center space-x-1 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase cursor-pointer whitespace-nowrap transition-colors ${
        active
          ? "bg-siddha-dark text-white shadow-xs"
          : "text-gray-500 hover:bg-slate-50 hover:text-siddha-dark"
      }`}
    >
      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      <span>{label}</span>
    </button>
  );
}
