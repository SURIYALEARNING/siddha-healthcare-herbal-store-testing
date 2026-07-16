import { Users } from "lucide-react";
import type { Consultation } from "../../types";

interface ConsultationsTabProps {
  consultations: Consultation[];
}

export default function ConsultationsTab({ consultations }: ConsultationsTabProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-4">
      <div className="border-b border-gray-50 pb-2 flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-base font-bold text-emerald-950 font-display">Client Consultations Inbox Logs</h3>
        <span className="text-xs bg-siddha-light text-siddha-dark px-3 py-1 rounded-full font-bold uppercase font-mono tracking-wider">
          {consultations.length} Logs recorded
        </span>
      </div>

      {consultations.length > 0 ? (
        <div className="space-y-4 divide-y divide-gray-100">
          {consultations.map((con) => (
            <div key={con.id} className="pt-4 first:pt-0 space-y-3">
              <div className="flex justify-between items-start gap-3 flex-wrap">
                <div>
                  <span className="text-[9px] font-mono text-gray-400 uppercase select-all font-bold">Log: {con.id}</span>
                  <h4 className="text-sm font-black text-emerald-950 tracking-tight mt-1">{con.fullName}</h4>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs font-bold text-slate-805 font-mono select-all">📞 Phone: {con.mobileNumber}</p>
                  {con.email && <p className="text-[10px] text-gray-400 select-all font-mono">✉ Email: {con.email}</p>}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="text-[10px] bg-emerald-50 text-siddha-dark font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Concern: {con.healthIssues || "No specific concern"}
                </span>
                <p className="text-xs text-gray-600 leading-normal font-medium mt-1.5">
                  Scheduled: {con.preferredDate} at {con.preferredTime} — Status: {con.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-gray-250 p-6">
          <Users className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-xs text-gray-400 mt-2">No clients have submitted consulting requests yet.</p>
        </div>
      )}
    </div>
  );
}
