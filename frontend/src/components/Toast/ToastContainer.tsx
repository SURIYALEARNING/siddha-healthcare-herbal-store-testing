import type { ToastItem } from "../../context/ToastContext";
import Toast from "./Toast";

interface ToastContainerProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 sm:bottom-5 sm:left-5 z-[9999] flex flex-col-reverse gap-2 pointer-events-none"
      style={{ width: "360px", maxWidth: "calc(100vw - 20px)" }}>
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  );
}
