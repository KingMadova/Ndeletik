"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Undo2 } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

export type ToastAction = { label: string; onClick: () => void };
type ToastState = { id: number; msg: string; ok: boolean; action?: ToastAction };

/**
 * Toasts empilés en bas de l'écran.
 * Signature rétro-compatible : toast(msg) / toast(msg, false) / toast(msg, true, action).
 */
type ToastFn = (msg: string, ok?: boolean, action?: ToastAction) => void;
const ToastCtx = createContext<{ toast: ToastFn } | null>(null);

/**
 * Fournit un seul empilement de toasts à tout le dashboard. Sans fournisseur, useToast()
 * garde son comportement d'origine (sa propre pile, à afficher via `node`).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const { toast, node } = useToastState();
  const value = useMemo(() => ({ toast }), [toast]);
  return (
    <ToastCtx.Provider value={value}>
      {children}
      {node}
    </ToastCtx.Provider>
  );
}

export function useToast(): { toast: ToastFn; node: ReactNode } {
  const ctx = useContext(ToastCtx);
  const local = useToastState();
  return ctx ? { toast: ctx.toast, node: null } : local;
}

function useToastState() {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (msg: string, ok = true, action?: ToastAction) => {
      const id = ++idRef.current;
      setToasts((t) => [...t.slice(-2), { id, msg, ok, action }]);
      window.setTimeout(() => dismiss(id), action ? 6000 : 3200);
    },
    [dismiss]
  );

  const node = (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[80] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className={`pointer-events-auto flex w-full items-center gap-2.5 rounded-2xl border px-4 py-3 shadow-soft backdrop-blur ${
              t.ok
                ? "border-line bg-surface/95 text-ink"
                : "border-fractal-terra/30 bg-fractal-terra/10 text-fractal-terra"
            }`}
          >
            {t.ok ? (
              <CheckCircle2 size={16} className="shrink-0 text-fractal-ocre" />
            ) : (
              <AlertCircle size={16} className="shrink-0" />
            )}
            <span className="flex-1 text-sm">{t.msg}</span>
            {t.action && (
              <button
                onClick={() => {
                  t.action!.onClick();
                  dismiss(t.id);
                }}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-fractal-terra hover:bg-soft"
              >
                <Undo2 size={12} /> {t.action.label}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return { toast, node };
}