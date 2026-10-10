import type { Profile } from "./themes/types";

export const toProfile = (data: any): { profile: Profile; plan: "free" | "pro" | "business" } => {
  return {
    profile: {
      slug: data.profile.slug,
      displayName: data.profile.display_name,
      avatarUrl: data.profile.avatar_url,
      coverUrl: data.profile.cover_url,
      bio: data.profile.bio,
      headline: data.profile.headline,
      verified: data.profile.verified,
      showBadge: data.profile.show_badge,
      themeId: data.profile.theme_id || "minimal",
      customTokens: data.profile.custom_tokens || {},
      socials: data.profile.socials || [],
      links: data.links.map((l: any) => ({
        id: l.id,
        title: l.title,
        url: l.url,
        icon: l.icon,
        enabled: l.enabled,
        position: l.position,
        clicks: l.clicks || 0,
      })),
      blocks: data.profile.blocks || [],
    },
    plan: data.plan || "free",
  };
};