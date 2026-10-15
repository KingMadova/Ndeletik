import type { CSSProperties } from "react";
import { FONT_QUERIES } from "./fonts";
import { CUSTOMIZABLE_KEYS, type CustomTokens, type Theme } from "./types";

/** Convertit un thème (+ surcharges Pro) en variables CSS --p-*. */
export function themeCssVars(theme: Theme, custom?: CustomTokens): CSSProperties {
  const t = { ...theme.tokens };
  if (custom) {
    for (const k of CUSTOMIZABLE_KEYS) {
      const v = custom[k];
      if (typeof v === "string" && v.trim()) t[k] = v;
    }
  }
  return {
    "--p-bg": t.bg,
    "--p-surface": t.surface,
    "--p-text": t.text,
    "--p-muted": t.muted,
    "--p-accent": t.accent,
    "--p-accent-2": t.accent2,
    "--p-on-accent": t.onAccent,
    "--p-border": t.border,
    "--p-radius": t.radius,
    "--p-shadow": t.shadow,
    "--p-header-bg": t.headerBg,
    "--p-font-display": `"${t.fontDisplay}"`,
    "--p-font-body": `"${t.fontBody}"`,
    "--p-tracking": theme.tracking ?? "0.02em",
  } as CSSProperties;
}

/**
 * URL Google Fonts du thème + polices surchargées (Pro).
 * Une famille déjà chargée par le thème n'est pas demandée deux fois.
 */
export function googleFontsHref(theme: Theme, custom?: CustomTokens): string | null {
  const list: string[] = [];
  const seen = new Set<string>();
  const push = (q: string) => {
    const name = q.split(":")[0];
    if (!seen.has(name)) {
      seen.add(name);
      list.push(q);
    }
  };
  theme.fonts.forEach(push);
  if (custom?.fontDisplay) {
    const q = FONT_QUERIES[custom.fontDisplay];
    if (q) push(q);
  }
  if (custom?.fontBody) {
    const q = FONT_QUERIES[custom.fontBody];
    if (q) push(q);
  }
  if (!list.length) return null;
  return `https://fonts.googleapis.com/css2?${list.map((f) => `family=${f}`).join("&")}&display=swap`;
}