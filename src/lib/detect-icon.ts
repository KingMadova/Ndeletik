/** Détecte automatiquement l'icône à partir de l'URL. */
export function detectIcon(url: string): string {
  if (!url) return "link";
  
  const lower = url.toLowerCase();
  
  // Réseaux sociaux
  if (lower.includes("instagram.com")) return "link"; // FaInstagram dans LinkTemplates
  if (lower.includes("tiktok.com")) return "link";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "link";
  if (lower.includes("facebook.com") || lower.includes("fb.com")) return "link";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "link";
  if (lower.includes("linkedin.com")) return "link";
  if (lower.includes("pinterest.com")) return "link";
  if (lower.includes("telegram") || lower.includes("t.me")) return "link";
  
  // Messagerie
  if (lower.includes("wa.me") || lower.includes("whatsapp.com")) return "message";
  if (lower.includes("mailto:")) return "mail";
  
  // Contact
  if (lower.includes("tel:")) return "phone";
  
  // Sites web
  if (lower.includes("calendly.com")) return "calendar";
  if (lower.includes("shopify.com") || lower.includes("etsy.com") || lower.includes("woocommerce")) return "bag";
  if (lower.includes("amazon")) return "bag";
  
  // Contenu
  if (lower.includes("spotify.com")) return "play";
  if (lower.includes("soundcloud.com")) return "play";
  if (lower.includes("medium.com") || lower.includes("blog")) return "book";
  if (lower.includes("github.com")) return "briefcase";
  if (lower.includes("dribbble.com") || lower.includes("behance")) return "briefcase";
  
  // Google Maps
  if (lower.includes("maps.google.com") || lower.includes("goo.gl/maps")) return "pin";
  
  // Fallback
  if (lower.startsWith("http")) return "globe";
  
  return "link";
}