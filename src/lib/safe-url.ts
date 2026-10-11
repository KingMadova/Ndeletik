/** Lien cliquable : http(s), mailto, tel uniquement (jamais javascript:). */
export function safeUrl(u?: string | null): string | undefined {
  if (!u) return undefined;
  try {
    const p = new URL(u).protocol;
    return ["http:", "https:", "mailto:", "tel:"].includes(p) ? u : undefined;
  } catch {
    return undefined;
  }
}

/** Image : https uniquement (utilisée par le rendu des profils). */
export function safeImageUrl(u?: string | null): string | undefined {
  if (!u) return undefined;
  try {
    return new URL(u).protocol === "https:" ? u : undefined;
  } catch {
    return undefined;
  }
}