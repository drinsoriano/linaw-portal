import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: "success" | "error" | "warning" | "info";
}

interface ToastContextValue {
  toast: (options: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

const VARIANT_ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((options: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...options, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
          {toasts.map((t) => {
            const Icon = VARIANT_ICONS[t.variant];
            return (
              <div
                key={t.id}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg animate-in slide-in-from-right-full",
                  VARIANT_STYLES[t.variant]
                )}
              >
                <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{t.title}</p>
                  {t.description && (
                    <p className="text-xs mt-0.5 opacity-80">{t.description}</p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
