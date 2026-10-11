import { planAtLeast, type Plan } from "../plans";
import { BUSINESS_THEMES } from "./business";
import { FREE_THEMES } from "./free";
import { PRO_THEMES } from "./pro";
import type { CustomTokens, Theme } from "./types";

/** Thème de secours (jamais proposé dans le sélecteur). */
export const FALLBACK_THEME: Theme = {
  id: "fallback",
  name: "Classique",
  plan: "free",
  layout: "pills",
  buttonStyle: "solid",
  header: "center",
  avatarShape: "circle",
  dark: false,
  fonts: ["Montserrat:wght@600;700;800", "Poppins:wght@400;500;600"],
  tokens: {
    bg: "#FFF9F3",
    surface: "#FFFFFF",
    text: "#18181B",
    muted: "#71717A",
    accent: "#FF6A1A",
    accent2: "#C1440E",
    onAccent: "#FFFFFF",
    border: "#ECE4DA",
    radius: "999px",
    shadow: "0 6px 20px -8px rgba(193,68,14,.25)",
    headerBg: "#F9A825",
    fontDisplay: "Montserrat",
    fontBody: "Poppins",
  },
};

export const ALL_THEMES: Theme[] = [...FREE_THEMES, ...PRO_THEMES, ...BUSINESS_THEMES];

const BY_ID = new Map(ALL_THEMES.map((t) => [t.id, t]));
export const getTheme = (id: string) => BY_ID.get(id);

/**
 * Thème réellement affiché. Si le thème demandé est inconnu ou verrouillé
 * pour ce plan, on retombe sur un thème gratuit (rien n'est supprimé en base).
 */
export function resolveTheme(themeId: string, plan: Plan): { theme: Theme; locked: boolean } {
  const wanted = BY_ID.get(themeId);
  if (wanted && planAtLeast(plan, wanted.plan)) return { theme: wanted, locked: false };
  return { theme: FREE_THEMES[0] ?? FALLBACK_THEME, locked: !!wanted };
}

/** Surcharges de couleurs : réservées au plan Pro et au-dessus. */
export const resolveCustomTokens = (custom: CustomTokens | undefined, plan: Plan) =>
  planAtLeast(plan, "pro") ? custom : undefined;