export type ThemeId = string;

export interface ThemeTokens {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  line: string;
  soft: string;
  ink: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  plan: "free" | "pro" | "business";
  tokens: ThemeTokens;
}

export interface CustomTokens {
  [key: string]: string;
}

export interface Social {
  type: string;
  url: string;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  enabled: boolean;
  position: number;
  clicks: number;
}

export interface Block {
  type: string;
  [key: string]: any;
}

export interface Profile {
  slug: string;
  displayName: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  headline?: string;
  verified: boolean;
  showBadge: boolean;
  themeId: ThemeId;
  customTokens: CustomTokens;
  socials: Social[];
  links: LinkItem[];
  blocks: Block[];
}