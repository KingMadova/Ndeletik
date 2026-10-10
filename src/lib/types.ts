/* Types alignés sur la migration 0002 (profils/liens nouveaux schémas). */

export type Profile = {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  country: string | null;
  views: number | null;
  verified: boolean;
  show_badge: boolean;
  theme_id: string;
  custom_tokens: Record<string, string>;
  socials: unknown[];
  blocks: unknown[];
  created_at?: string;
  updated_at?: string;
};

export type LinkItem = {
  id: string;
  profile_id: string;
  title: string;
  subtitle: string | null;
  url: string;
  icon: string | null;
  image_url: string | null;
  cta: string | null;
  featured: boolean;
  enabled: boolean;
  position: number;
  clicks: number;
  created_at?: string;
};