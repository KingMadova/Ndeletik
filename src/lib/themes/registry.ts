import type { Theme } from "./types";
import { FREE_THEMES } from "./free";
import { PRO_THEMES } from "./pro";
import { BUSINESS_THEMES } from "./business";

export const ALL_THEMES: Theme[] = [...FREE_THEMES, ...PRO_THEMES, ...BUSINESS_THEMES];

export const getTheme = (id: string): Theme | undefined => {
  return ALL_THEMES.find((t) => t.id === id);
};

export const resolveTheme = (
  themeId: string,
  plan: "free" | "pro" | "business"
): { theme: Theme; locked: boolean } => {
  const theme = getTheme(themeId);
  
  if (!theme) {
    return { theme: FREE_THEMES[0], locked: false };
  }
  
  if (theme.plan === "free") {
    return { theme, locked: false };
  }
  
  if (theme.plan === "pro" && (plan === "pro" || plan === "business")) {
    return { theme, locked: false };
  }
  
  if (theme.plan === "business" && plan === "business") {
    return { theme, locked: false };
  }
  
  return { theme: FREE_THEMES[0], locked: true };
};

export const resolveCustomTokens = (tokens: any, plan: string) => {
  if (plan === "pro" || plan === "business") {
    return tokens || {};
  }
  return {};
};