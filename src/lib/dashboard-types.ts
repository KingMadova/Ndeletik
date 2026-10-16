import type { Plan } from "./plans";

/** Ligne brute de la table `profiles` (colonnes réellement lues par le dashboard). */
export type DbProfile = {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  theme_id: string;
  created_at?: string;
  [key: string]: unknown;
};

/** Ligne brute de la table `links`. */
export type DbLink = {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  icon: string | null;
  enabled: boolean;
  clicks: number;
  position: number;
  subtitle?: string | null;
  image_url?: string | null;
  cta?: string | null;
  featured?: boolean | null;
};

export type ProfileSummary = Pick<DbProfile, "id" | "slug" | "display_name" | "avatar_url">;

export const PLAN_LABEL: Record<Plan, string> = { free: "Gratuit", pro: "Pro", business: "Business" };

/** Cookie qui mémorise le profil sélectionné (lu aussi côté serveur par /dashboard/themes et /sections). */
export const PROFILE_COOKIE = "nd_profile";
