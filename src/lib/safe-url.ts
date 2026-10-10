export const safeUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export const safeImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  return safeUrl(url) ? url : undefined;
};