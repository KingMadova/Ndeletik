export function safeUrl(u?: string | null): string | undefined {
  if (!u) return undefined;
  try {
    const p = new URL(u).protocol;
    return ["http:", "https:", "mailto:", "tel:"].includes(p) ? u : undefined;
  } catch { return undefined; }
}

export function safeImageUrl(u?: string | null): string | undefined {
  if (!u || !/^https:\/\/[^\s"'()]+$/.test(u)) return undefined;
  return u;
}