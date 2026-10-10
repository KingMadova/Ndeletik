import type { Theme, CustomTokens } from "./types";

export const googleFontsHref = (theme: Theme): string => {
  return "";
};

export const themeCssVars = (theme: Theme, custom?: CustomTokens): Record<string, string> => {
  const merged = { ...theme.tokens, ...custom };
  const vars: Record<string, string> = {};
  
  Object.entries(merged).forEach(([key, value]) => {
    vars[`--p-${key}`] = value;
  });
  
  return vars;
};