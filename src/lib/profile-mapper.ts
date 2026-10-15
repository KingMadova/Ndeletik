import { sanitizeCustomTokens } from "./entitlements";
import type { Plan } from "./plans";
import { safeImageUrl, safeUrl } from "./safe-url";
import type { Block, LinkItem, Profile, Social, SocialType } from "./themes/types";

const SOCIALS: SocialType[] = [
  "instagram", "tiktok", "youtube", "facebook", "whatsapp",
  "x", "linkedin", "telegram", "pinterest", "email",
];

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.slice(0, max) : "");
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const iconKey = (v: unknown) => (typeof v === "string" && /^[a-z]{2,20}$/.test(v) ? v : undefined);
const emoji = (v: unknown) => (typeof v === "string" ? v.slice(0, 16) : undefined);

function toBlocks(raw: unknown): Block[] {
  const out: Block[] = [];
  for (const b of arr(raw) as Record<string, unknown>[]) {
    if (!b || typeof b !== "object") continue;
    if (b.type === "about") {
      out.push({ type: "about", title: str(b.title, 80), text: str(b.text, 1200) });
    } else if (b.type === "newsletter") {
      out.push({ type: "newsletter", title: str(b.title, 80), subtitle: str(b.subtitle, 160) || undefined });
    } else if (b.type === "stats") {
      out.push({
        type: "stats",
        items: (arr(b.items) as Record<string, unknown>[]).slice(0, 4).map((i) => ({
          value: str(i?.value, 12),
          label: str(i?.label, 24),
        })),
      });
    } else if (b.type === "faq") {
      out.push({
        type: "faq",
        items: (arr(b.items) as Record<string, unknown>[]).slice(0, 10).map((i) => ({
          q: str(i?.q, 140),
          a: str(i?.a, 600),
        })),
      });
    } else if (b.type === "offer") {
      out.push({
        type: "offer",
        tag: str(b.tag, 24) || undefined,
        title: str(b.title, 80),
        desc: str(b.desc, 160) || undefined,
        icon: iconKey(b.icon),
        emoji: emoji(b.emoji),
        image: safeImageUrl(typeof b.image === "string" ? b.image : null),
        dateLabel: str(b.dateLabel, 12) || undefined,
        dateValue: str(b.dateValue, 12) || undefined,
        cta: str(b.cta, 24) || undefined,
        url: safeUrl(typeof b.url === "string" ? b.url : null),
      });
    } else if (b.type === "contact") {
      out.push({
        type: "contact",
        icon: iconKey(b.icon),
        emoji: emoji(b.emoji),
        title: str(b.title, 80),
        text: str(b.text, 160) || undefined,
        url: safeUrl(typeof b.url === "string" ? b.url : null),
      });
    } else if (b.type === "hint") {
      out.push({ type: "hint", emoji: emoji(b.emoji), label: str(b.label, 40) });
    } else if (b.type === "separator") {
      out.push({ type: "separator", label: str(b.label, 40) || undefined });
    }
  }
  return out;
}

/** Résultat de la fonction SQL get_public_profile → types du rendu. */
export function toProfile(payload: any): { profile: Profile; plan: Plan } {
  const p = payload.profile;
  const socials: Social[] = (arr(p.socials) as Record<string, unknown>[])
    .filter((s) => SOCIALS.includes(s?.type as SocialType) && safeUrl(str(s?.url, 2048)))
    .map((s) => ({ type: s.type as SocialType, url: str(s.url, 2048) }));
  const links: LinkItem[] = (arr(payload.links) as Record<string, any>[]).map((l) => ({
    id: l.id,
    title: str(l.title, 80),
    subtitle: str(l.subtitle, 160) || undefined,
    url: str(l.url, 2048),
    icon: l.icon ?? undefined,
    image: safeImageUrl(l.image_url),
    cta: str(l.cta, 24) || undefined,
    featured: !!l.featured,
    enabled: l.enabled !== false,
  }));
  return {
    plan: (["free", "pro", "business"].includes(payload.plan) ? payload.plan : "free") as Plan,
    profile: {
      slug: p.slug,
      displayName: str(p.display_name, 80),
      headline: str(p.headline, 120) || undefined,
      bio: str(p.bio, 400) || undefined,
      avatarUrl: safeImageUrl(p.avatar_url),
      coverUrl: safeImageUrl(p.cover_url),
      verified: !!p.verified,
      showBadge: p.show_badge !== false,
      themeId: p.theme_id,
      customTokens: sanitizeCustomTokens(p.custom_tokens),
      socials,
      links,
      blocks: toBlocks(p.blocks),
    },
  };
}