import type { ReactNode } from "react";
import { clsx } from "clsx";

const tones = {
  neutral: "bg-soft text-muted",
  brand: "bg-fractal-ocre/10 text-fractal-terra",
  success: "bg-emerald-50 text-emerald-700",
} as const;

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return (
    <span className={clsx("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", tones[tone])}>
      {children}
    </span>
  );
}
