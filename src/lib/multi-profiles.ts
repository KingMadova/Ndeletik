import type { Plan } from "./plans";

/** Limites de profils par plan (doit rester identique au SQL). */
export const PROFILE_LIMITS: Record<Plan, number> = {
  free: 1,
  pro: 3,
  business: 10,
};

export function canCreateProfile(plan: Plan, currentCount: number): boolean {
  return currentCount < PROFILE_LIMITS[plan];
}

export function profileLimitMessage(plan: Plan): string {
  const limit = PROFILE_LIMITS[plan];
  if (plan === "free") return `Plan Gratuit : 1 profil maximum. Passe au Pro pour en créer jusqu'à ${PROFILE_LIMITS.pro}.`;
  if (plan === "pro") return `Plan Pro : ${limit} profils maximum. Passe au Business pour en créer jusqu'à ${PROFILE_LIMITS.business}.`;
  return `Plan Business : ${limit} profils maximum.`;
}