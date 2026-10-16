import { cache } from "react";
import { avatarDataUri, landingOg, OG_SIZE, OG_TYPE, profileOg } from "@/lib/og";
import { toProfile } from "@/lib/profile-mapper";
import { createPublicClient } from "@/lib/supabase/public";
import { DEMO_PROFILE } from "@/lib/themes/demo";
import { FALLBACK_THEME, resolveTheme } from "@/lib/themes/registry";

export const alt = "Page de liens Ndeletik";
export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const revalidate = 300;

const load = cache(async (handle: string) => {
  const decoded = decodeURIComponent(handle);
  if (!decoded.startsWith("@")) return null;
  if (decoded === "@demo") return { profile: DEMO_PROFILE, plan: "business" as const };
  const { data } = await createPublicClient().rpc("get_public_profile", { p_slug: decoded.slice(1) });
  return data ? toProfile(data) : null;
});

export default async function Image({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const res = await load(handle);
  if (!res) return landingOg();

  const { profile, plan } = res;
  const { theme } = resolveTheme(profile.themeId, plan);
  return profileOg({
    name: profile.displayName,
    slug: profile.slug,
    headline: profile.headline,
    avatar: await avatarDataUri(profile.avatarUrl),
    tokens: (theme ?? FALLBACK_THEME).tokens,
  });
}
