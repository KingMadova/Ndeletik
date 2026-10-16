import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

/** Surface standard du dashboard : fond blanc, bordure chaude, ombre douce. */
export function Card({ className, padded = true, ...rest }: HTMLAttributes<HTMLDivElement> & { padded?: boolean }) {
  return (
    <div
      className={clsx("rounded-2xl border border-line bg-surface shadow-soft", padded && "p-5", className)}
      {...rest}
    />
  );
}

export function CardTitle({ children, hint }: { children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="mb-3">
      <h2 className="font-display text-sm font-bold text-ink">{children}</h2>
      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
