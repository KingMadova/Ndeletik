import type { Plan } from "../plans";
export type { Plan };

/** Les 4 familles de mise en page des liens. */
export type LinkLayout = "pills" | "cards" | "grid" | "banners";
/** Style des boutons / cartes. */
export type ButtonStyle = "solid" | "outline" | "glass" | "soft" | "neu" | "gradient";
/** Variantes d'en-tête. */
export type HeaderVariant = "center" | "cover" | "arc";
export type AvatarShape = "circle" | "blob" | "rounded";

/** Valeurs CSS pures : tout le look d'un thème tient ici. */
export interface ThemeTokens {
  bg: string;        // n'importe quelle valeur CSS `background`
  surface: string;   // fond des cartes / boutons doux
  text: string;
  muted: string;
  accent: string;
  accent2: string;   // 2e couleur des dégradés
  onAccent: string;  // texte posé sur l'accent
  border: string;
  radius: string;    // ex. "999px", "16px", "0px"
  shadow: string;
  headerBg: string;  // fond du cover / de l'arc d'en-tête
  fontDisplay: string; // nom de police (titres)
  fontBody: string;    // nom de police (texte)
}

export interface Theme {
  id: string;
  name: string;
  plan: Plan;
  layout: LinkLayout;
  buttonStyle: ButtonStyle;
  header: HeaderVariant;
  avatarShape: AvatarShape;
  dark: boolean;
  uppercaseLinks?: boolean;
  uppercaseName?: boolean;
  tracking?: string; // letter-spacing des liens, ex. "0.12em"
  /** Polices Google, format API css2 : "Playfair+Display:wght@400;700". */
  fonts: string[];
  tokens: ThemeTokens;
}

/** Ce qu'un utilisateur Pro peut surcharger (liste blanche). */
export const CUSTOMIZABLE_KEYS = ["bg", "surface", "text", "accent", "accent2", "onAccent", "radius"] as const;
export type CustomTokens = Partial<Pick<ThemeTokens, (typeof CUSTOMIZABLE_KEYS)[number]>>;

/* ---------- Profil ---------- */
export type SocialType =
  | "instagram" | "tiktok" | "youtube" | "facebook" | "whatsapp"
  | "x" | "linkedin" | "telegram" | "pinterest" | "email";

export interface Social { type: SocialType; url: string }

export interface LinkItem {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  icon?: string;     // clé dans components/profile/icons.tsx
  image?: string;    // mise en page "banners"
  cta?: string;      // bouton des bannières
  featured?: boolean;
  enabled?: boolean;
}

export type Block =
  | { type: "about"; title: string; text: string }
  | { type: "stats"; items: { value: string; label: string }[] }
  | { type: "faq"; items: { q: string; a: string }[] }
  | { type: "newsletter"; title: string; subtitle?: string };

export interface Profile {
  slug: string;
  displayName: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  verified?: boolean;
  themeId: string;
  customTokens?: CustomTokens;
  socials: Social[];
  links: LinkItem[];
  blocks?: Block[];
  showBadge?: boolean;
}