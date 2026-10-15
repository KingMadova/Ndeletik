/** Détection ordonnée : premier match gagnant. */
const PLATFORM_DOMAINS: [string, string][] = [
  ["instagram.com", "instagram"],
  ["tiktok.com", "tiktok"],
  ["youtube.com", "youtube"],
  ["youtu.be", "youtube"],
  ["facebook.com", "facebook"],
  ["fb.com", "facebook"],
  ["wa.me", "whatsapp"],
  ["whatsapp.com", "whatsapp"],
  ["twitter.com", "x"],
  ["x.com", "x"],
  ["linkedin.com", "linkedin"],
  ["t.me", "telegram"],
  ["telegram.me", "telegram"],
  ["pinterest.", "pinterest"],
  ["spotify.com", "spotify"],
  ["soundcloud.com", "soundcloud"],
  ["snapchat.com", "snapchat"],
  ["twitch.tv", "twitch"],
  ["discord.gg", "discord"],
  ["discord.com", "discord"],
  ["github.com", "github"],
  ["medium.com", "medium"],
  ["substack.com", "substack"],
  ["patreon.com", "patreon"],
  ["etsy.com", "etsy"],
  ["shopify.com", "shopify"],
  ["amazon.", "amazon"],
  ["paypal.me", "paypal"],
  ["paypal.com", "paypal"],
  ["calendly.com", "calendly"],
  ["maps.google.", "maps"],
  ["goo.gl/maps", "maps"],
  ["google.com/maps", "maps"],
];

/** Plateforme détectée dans l'URL (null si aucune). */
export function detectPlatform(url?: string | null): string | null {
  if (!url) return null;
  const u = url.toLowerCase();
  if (u.startsWith("mailto:")) return "email";
  if (u.startsWith("tel:")) return "phone";
  for (const [needle, key] of PLATFORM_DOMAINS) {
    if (u.includes(needle)) return key;
  }
  return null;
}

/** Nom stocké dans links.icon (contrainte SQL : ^[a-z]{2,20}$). */
export function detectIcon(url: string): string {
  const platform = detectPlatform(url);
  if (platform === "maps") return "pin";
  if (platform === "phone") return "phone";
  if (platform) return platform;

  const u = url.toLowerCase();
  if (u.includes("calendly") || u.includes("booking") || u.includes("rendez-vous")) return "calendar";
  if (u.includes("shop") || u.includes("boutique") || u.includes("store")) return "bag";
  if (u.includes("music") || u.includes("podcast") || u.includes("audio")) return "play";
  if (u.includes("blog") || u.includes("article") || u.includes("guide")) return "book";
  if (u.includes("portfolio") || u.includes("resume") || u.includes("cv")) return "briefcase";
  if (u.includes("donation") || u.includes("don") || u.includes("tip")) return "heart";
  if (u.includes("form") || u.includes("typeform") || u.includes("survey")) return "file";
  if (u.startsWith("http")) return "globe";
  return "link";
}