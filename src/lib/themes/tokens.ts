import type { CSSProperties } from "react";
import { CUSTOMIZABLE_KEYS, type CustomTokens, type Theme } from "./types";

export function themeCssVars(theme: Theme, custom?: CustomTokens): CSSProperties {
  const t = { ...theme.tokens };
  if (custom) {
    for (const k of CUSTOMIZABLE_KEYS) {
      const v = custom[k];
      if (typeof v === "string" && v.trim()) t[k] = v;
    }
  }
  return {
    "--p-bg": t.bg, "--p-surface": t.surface, "--p-text": t.text, "--p-muted": t.muted,
    "--p-accent": t.accent, "--p-accent-2": t.accent2, "--p-on-accent": t.onAccent,
    "--p-border": t.border, "--p-radius": t.radius, "--p-shadow": t.shadow,
    "--p-header-bg": t.headerBg, "--p-font-display": `"${t.fontDisplay}"`,
    "--p-font-body": `"${t.fontBody}"`, "--p-tracking": theme.tracking ?? "0.02em",
  } as CSSProperties;
}

export function googleFontsHref(theme: Theme): string | null {
  if (!theme.fonts.length) return null;
  return `https://fonts.googleapis.com/css2?${theme.fonts.map((f) => `family=${f}`).join("&")}&display=swap`;
}