import type { Plan } from "../plans";
export type { Plan };

/** Les 4 familles de mise en page des liens. */
export type LinkLayout = "pills" | "cards" | "grid" | "banners";
/** Style des boutons / cartes. */
export type ButtonStyle = "solid" | "outline" | "glass" | "soft" | "neu" | "gradient";
/** Variantes d'en-tête. */
export type HeaderVariant = "center" | "cover" | "arc" | "portrait";
export type AvatarShape = "circle" | "blob" | "rounded";
/** Côté d'ancrage des images détourées (popout). */
export type PopoutSide = "left" | "right" | "alternate";
/** Ornements d'arrière-plan. */
export type Decor = "none" | "halo" | "leaves" | "curves";
/** Mode d'affichage de l'image d'un lien. */
export type ImageMode = "cover" | "popout" | "contain";

/** Valeurs CSS pures : tout le look d'un thème tient ici. */
export interface ThemeTokens {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  onAccent: string;
  border: string;
  radius: string;
  shadow: string;
  headerBg: string;
  fontDisplay: string;
  fontBody: string;
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
  tracking?: string;
  /** Polices Google, format API css2 : "Playfair+Display:wght@400;700". */
  fonts: string[];
  /** Côté d'ancrage des images popout (défaut : alternate). */
  popoutSide?: PopoutSide;
  /** Ornement d'arrière-plan (défaut : none). */
  decor?: Decor;
  /**
   * Rangée de réseaux compacte avec les 6 majeurs d'abord
   * (Facebook, Instagram, TikTok, X, YouTube, LinkedIn), les autres ensuite.
   */
  popularSocials?: boolean;
  tokens: ThemeTokens;
}

/** Ce qu'un utilisateur Pro peut surcharger (liste blanche). */
export const CUSTOMIZABLE_KEYS = [
  "bg",
  "surface",
  "text",
  "accent",
  "accent2",
  "onAccent",
  "radius",
  "fontDisplay",
  "fontBody",
] as const;
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
  icon?: string;
  image?: string;
  /** Mode d'affichage de l'image (défaut : cover). */
  imageMode?: ImageMode;
  cta?: string;
  featured?: boolean;
  enabled?: boolean;
}

/* ---------- Blocs de contenu ---------- */
export type Block =
  | { type: "about"; title: string; text: string }
  | { type: "stats"; items: { value: string; label: string }[] }
  | { type: "faq"; items: { q: string; a: string }[] }
  | { type: "newsletter"; title: string; subtitle?: string }
  | {
      type: "offer";
      tag?: string;
      title: string;
      desc?: string;
      icon?: string;
      emoji?: string;
      image?: string;
      dateLabel?: string;
      dateValue?: string;
      cta?: string;
      url?: string;
    }
  | { type: "contact"; icon?: string; emoji?: string; title: string; text?: string; url?: string }
  | { type: "hint"; emoji?: string; label: string }
  | { type: "separator"; label?: string };

export interface Profile {
  slug: string;
  displayName: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  /** Grand portrait détouré de l'en-tête « portrait » (PNG/WebP transparent). */
  heroUrl?: string;
  verified?: boolean;
  themeId: string;
  customTokens?: CustomTokens;
  socials: Social[];
  links: LinkItem[];
  blocks?: Block[];
  showBadge?: boolean;
}