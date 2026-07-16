import { LogOut } from "lucide-react";

interface AccountHeaderProps {
  fullName: string;
  onSignOut: () => void;
}

export default function AccountHeader({ fullName, onSignOut }: AccountHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-emerald-950 to-siddha-dark p-6 sm:p-8 rounded-3xl text-white mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden shadow-md">
      <div className="absolute top-0 right-0 w-32 h-32 bg-siddha-light rounded-full filter blur-3xl opacity-10"></div>
      <div className="space-y-1.5 z-10">
        <p className="text-[10px] font-bold text-siddha-gold uppercase tracking-widest block">Buyer Console</p>
        <h1 className="text-2xl sm:text-3.5xl font-black font-display tracking-tight">Vanakkam, {fullName}!</h1>
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
  );
}
