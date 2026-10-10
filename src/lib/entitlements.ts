import { planAtLeast, type Plan } from "./plans";
import { getTheme } from "./themes/registry";
import { CUSTOMIZABLE_KEYS, type CustomTokens } from "./themes/types";

/** Doit rester identique à la table SQL plan_entitlements. */
export const ENTITLEMENTS: Record<
  Plan,
  { maxLinks: number | null; customColors: boolean; removeBadge: boolean; customDomain: boolean }
> = {
  free: { maxLinks: 5, customColors: false, removeBadge: false, customDomain: false },
  pro: { maxLinks: null, customColors: true, removeBadge: true, customDomain: false },
  business: { maxLinks: null, customColors: true, removeBadge: true, customDomain: true },
};

export type Feature = "customColors" | "removeBadge" | "customDomain";

export const canUse = (plan: Plan, feature: Feature) => ENTITLEMENTS[plan][feature];
export const maxLinks = (plan: Plan) => ENTITLEMENTS[plan].maxLinks;

/** Le plan donne-t-il accès à ce thème ? (inconnu = non) */
export function canUseTheme(plan: Plan, themeId: string) {
  const t = getTheme(themeId);
  return !!t && planAtLeast(plan, t.plan);
}

export const requiredPlanForTheme = (themeId: string): Plan | null => getTheme(themeId)?.plan ?? null;

const COLOR = /^(#[0-9a-fA-F]{3,8}|rgba?(\s*[0-9.%\s,]+))$/;
const RADIUS = /^[0-9]{1,3}px$/;

/** Ne garde que des valeurs sûres (même règle que is_safe_token en SQL). */
export function sanitizeCustomTokens(input: unknown): CustomTokens {
  const out: CustomTokens = {};
  if (!input || typeof input !== "object") return out;
  for (const k of CUSTOMIZABLE_KEYS) {
    const v = (input as Record<string, unknown>)[k];
    if (typeof v !== "string") continue;
    const ok = k === "radius" ? RADIUS.test(v) : COLOR.test(v);
    if (ok) out[k] = v;
  }
  return out;
}