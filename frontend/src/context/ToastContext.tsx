import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  autoClose: boolean | number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (type: ToastType, title: string, message?: string, autoClose?: boolean | number) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string, autoClose?: boolean | number) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const globalRef = useRef<ToastContextValue | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message = "", autoClose: boolean | number = true) => {
      const id = `toast_${++counter}_${Date.now()}`;
      setToasts((prev) => [...prev, { id, type, title, message, autoClose }]);
    },
    []
  );

  const showSuccess = useCallback(
    (title: string, message?: string) => showToast("success", title, message),
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string, autoClose?: boolean | number) =>
      showToast("error", title, message, autoClose ?? false),
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string) => showToast("warning", title, message),
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => showToast("info", title, message),
    [showToast]
  );

  useEffect(() => {
    const value: ToastContextValue = { toasts, showToast, showSuccess, showError, showWarning, showInfo, removeToast };
    globalRef.current = value;
    (window as any).__toast = value;
    return () => { (window as any).__toast = null; };
  }, [toasts, showToast, showSuccess, showError, showWarning, showInfo, removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, showSuccess, showError, showWarning, showInfo, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToastContext must be used inside ToastProvider");
  return ctx;
}
