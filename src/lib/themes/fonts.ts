/** Liste FERMÉE des polices surchargeables (plan Pro+). Miroir exact de SQL is_safe_token. */
export const FONT_OPTIONS = [
  "Montserrat",
  "Poppins",
  "Playfair Display",
  "Inter",
  "Cormorant Garamond",
  "Roboto",
  "DM Sans",
  "Outfit",
  "Pacifico",
  "Open Sans",
] as const;

export type FontOption = (typeof FONT_OPTIONS)[number];

/** Requête Google Fonts (css2) pour chaque police autorisée. */
export const FONT_QUERIES: Record<string, string> = {
  Montserrat: "Montserrat:wght@500;600;700;800",
  Poppins: "Poppins:wght@400;500;600",
  "Playfair Display": "Playfair+Display:wght@500;600;700",
  Inter: "Inter:wght@400;500;600;700;800",
  "Cormorant Garamond": "Cormorant+Garamond:wght@500;600;700",
  Roboto: "Roboto:wght@400;500;700;900",
  "DM Sans": "DM+Sans:wght@400;500;600",
  Outfit: "Outfit:wght@400;500;600",
  Pacifico: "Pacifico",
  "Open Sans": "Open+Sans:wght@400;600;700",
};