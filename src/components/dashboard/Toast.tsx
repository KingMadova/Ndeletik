"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle } from "lucide-react";

type ToastState = { id: number; msg: string; ok: boolean };

export function useToast(duration = 2600) {
  const [state, setState] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback(
    (msg: string, ok = true) => {
      if (timer.current) clearTimeout(timer.current);
      setState({ id: Date.now(), msg, ok });
      timer.current = setTimeout(() => setState(null), duration);
    },
    [duration]
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const node = (
    <AnimatePresence>
      {state && (
        <motion.div
          key={state.id}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.18 }}
          className="fixed bottom-6 inset-x-0 z-[70] flex justify-center pointer-events-none px-4"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 rounded-full bg-ink text-surface text-sm pl-3 pr-4 py-2.5 shadow-soft border border-line">
            {state.ok ? (
              <CheckCircle2 size={16} className="text-fractal-ocre shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-red-400 shrink-0" />
            )}
            {state.msg}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return { toast, node };
}