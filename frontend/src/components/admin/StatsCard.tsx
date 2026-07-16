interface StatsCardProps {
  label: string;
  value: string | number;
  footer: string;
  footerColor?: string;
}

export default function StatsCard({ label, value, footer, footerColor = "text-emerald-600" }: StatsCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 relative overflow-hidden shadow-xs">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{label}</span>
      <p className="text-3xl font-black text-siddha-dark font-mono mt-1.5 leading-none">{value}</p>
      <p className={`text-[10px] font-bold mt-2 font-mono ${footerColor}`}>{footer}</p>
    </div>
  );
}
