import type { Plan } from "./plans";

export const canUse = (plan: Plan, feature: "customColors" | "removeBadge" | "customDomain"): boolean => {
  if (plan === "business") return true;
  if (plan === "pro") return feature === "customColors" || feature === "removeBadge";
  return false;
};