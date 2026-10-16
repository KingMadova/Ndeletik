import type { ReactNode } from "react";
import { clsx } from "clsx";

/** Style unique des champs de saisie du dashboard. */
export const inputClass =
  "w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink placeholder:text-muted/70 " +
  "transition-colors focus:border-fractal-ocre focus:outline-none focus:ring-2 focus:ring-fractal-ocre/20";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-ink">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

/** Interrupteur accessible (role="switch"). */
export function Switch({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fractal-ocre",
        checked ? "bg-fractal-ocre" : "bg-line",
        className
      )}
    >
      <span
        className={clsx(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-1"
        )}
      />
    </button>
  );
}
