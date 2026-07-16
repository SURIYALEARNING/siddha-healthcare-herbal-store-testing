import { useEffect, useState } from "react";
import { CheckCircle, XCircle, TriangleAlert, Info, X } from "lucide-react";
import type { ToastItem } from "../../context/ToastContext";

const typeConfig = {
  success: {
    borderColor: "border-l-emerald-500",
    bg: "bg-emerald-50",
    icon: CheckCircle,
    iconColor: "text-emerald-600",
  },
  error: {
    borderColor: "border-l-red-500",
    bg: "bg-red-50",
    icon: XCircle,
    iconColor: "text-red-600",
  },
  warning: {
    borderColor: "border-l-orange-400",
    bg: "bg-orange-50",
    icon: TriangleAlert,
    iconColor: "text-orange-500",
  },
  info: {
    borderColor: "border-l-blue-500",
    bg: "bg-blue-50",
    icon: Info,
    iconColor: "text-blue-600",
  },
};

interface ToastProps {
  toast: ToastItem;
  onClose: (id: string) => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  const [exiting, setExiting] = useState(false);
  const cfg = typeConfig[toast.type];
  const Icon = cfg.icon;

  useEffect(() => {
    if (toast.autoClose === false) return;
    const duration = typeof toast.autoClose === "number" ? toast.autoClose : 5000;
    const timer = setTimeout(() => handleClose(), duration);
    return () => clearTimeout(timer);
  }, [toast.id]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onClose(toast.id), 300);
  };

  return (
    <div
      className={`toast-enter ${exiting ? "toast-exit" : ""} ${cfg.bg} border-l-4 ${cfg.borderColor} rounded-xl shadow-lg shadow-black/5 border border-gray-100/80 flex items-start gap-3 p-4 min-w-0 pointer-events-auto`}
      style={{ width: "100%" }}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.iconColor}`} />
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-sm font-bold text-gray-900 leading-tight">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-gray-600 leading-relaxed">{toast.message}</p>
        )}
      </div>
      <button
        onClick={handleClose}
        className="shrink-0 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer p-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
