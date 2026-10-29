import { Crown } from "lucide-react";
import { clsx } from "clsx";
import { PLAN_COLORS, PLAN_LABELS } from "@/lib/admin-types";

export function PlanDot({ plan }: { plan: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span className="h-2 w-2 rounded-full" style={{ background: PLAN_COLORS[plan] ?? PLAN_COLORS.free }} />
      {PLAN_LABELS[plan] ?? plan}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const admin = role === "admin";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        admin ? "bg-fractal-ocre/10 text-fractal-terra" : "bg-soft text-muted"
      )}
    >
      {admin && <Crown size={11} aria-hidden />}
      {admin ? "Admin" : "Utilisateur"}
    </span>
  );
}
