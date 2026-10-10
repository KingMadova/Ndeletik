export type Plan = "free" | "pro" | "business";

export const PLAN_RANK: Record<Plan, number> = { free: 0, pro: 1, business: 2 };

export function planAtLeast(current: Plan, required: Plan): boolean {
  return PLAN_RANK[current] >= PLAN_RANK[required];
}