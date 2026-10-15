import {
  BadgeCheck, BookOpen, Briefcase, Calendar, ChevronDown, ChevronRight, Dumbbell, FileText, Gift, Globe,
  Heart, Image as ImgIcon, Leaf, Link2, Mail, MapPin, MessageCircle, Phone, Play, Scale, ShoppingBag, Star, Tag, Users,
  type LucideIcon,
} from "lucide-react";
import type { IconType } from "react-icons";
import {
  FaAmazon, FaDiscord, FaEnvelope, FaEtsy, FaFacebookF, FaGithub, FaGoogle, FaInstagram, FaLinkedinIn,
  FaMedium, FaPatreon, FaPaypal, FaPinterestP, FaShopify, FaSnapchat, FaSoundcloud, FaSpotify, FaTelegram,
  FaTiktok, FaTwitch, FaWhatsapp, FaXTwitter, FaYoutube,
} from "react-icons/fa6";
import { SiCalendly, SiSubstack } from "react-icons/si";
import type { SocialType } from "@/lib/themes/types";
import { detectPlatform } from "@/lib/detect-icon";

export const LINK_ICONS: Record<string, LucideIcon> = {
  link: Link2, calendar: Calendar, file: FileText, image: ImgIcon, pin: MapPin, message: MessageCircle,
  bag: ShoppingBag, heart: Heart, gift: Gift, dumbbell: Dumbbell, mail: Mail, globe: Globe, phone: Phone,
  star: Star, tag: Tag, users: Users, leaf: Leaf, play: Play, book: BookOpen, briefcase: Briefcase, scale: Scale,
};

const SOCIAL_ICONS: Record<SocialType, IconType> = {
  instagram: FaInstagram, tiktok: FaTiktok, youtube: FaYoutube, facebook: FaFacebookF, whatsapp: FaWhatsapp,
  x: FaXTwitter, linkedin: FaLinkedinIn, telegram: FaTelegram, pinterest: FaPinterestP, email: FaEnvelope,
};

/** Icônes de marque des plateformes détectées dans l'URL ou stockées dans links.icon. */
export const PLATFORM_ICONS: Record<string, IconType> = {
  instagram: FaInstagram, tiktok: FaTiktok, youtube: FaYoutube, facebook: FaFacebookF, whatsapp: FaWhatsapp,
  x: FaXTwitter, linkedin: FaLinkedinIn, telegram: FaTelegram, pinterest: FaPinterestP, spotify: FaSpotify,
  soundcloud: FaSoundcloud, snapchat: FaSnapchat, twitch: FaTwitch, discord: FaDiscord, github: FaGithub,
  medium: FaMedium, substack: SiSubstack, patreon: FaPatreon, etsy: FaEtsy, shopify: FaShopify,
  amazon: FaAmazon, paypal: FaPaypal, google: FaGoogle, calendly: SiCalendly, email: FaEnvelope,
};

export function LinkIcon({ name, size = 18 }: { name?: string; size?: number }) {
  const I = (name && LINK_ICONS[name]) || Link2;
  return <I size={size} aria-hidden />;
}

export function SocialIcon({ type }: { type: SocialType }) {
  const I = SOCIAL_ICONS[type];
  return <I aria-hidden />;
}

/**
 * Icône d'un lien sur la page publique :
 * 1. plateforme détectée dans l'URL (icône de marque)
 * 2. icône stockée dans links.icon (marque ou générique)
 * 3. repli : maillon de chaîne.
 * Le style (couleur, fond) reste celui du thème via .nd-ic : aucun thème n'est modifié.
 */
export function SmartLinkIcon({ url, name, size = 18 }: { url?: string; name?: string; size?: number }) {
  const platform = detectPlatform(url);
  if (platform === "maps") return <MapPin size={size} aria-hidden />;
  if (platform === "phone") return <Phone size={size} aria-hidden />;
  if (platform && PLATFORM_ICONS[platform]) {
    const Brand = PLATFORM_ICONS[platform];
    return <Brand size={size} aria-hidden />;
  }
  if (name) {
    if (PLATFORM_ICONS[name]) {
      const Brand = PLATFORM_ICONS[name];
      return <Brand size={size} aria-hidden />;
    }
    const Generic = LINK_ICONS[name];
    if (Generic) return <Generic size={size} aria-hidden />;
  }
  return <Link2 size={size} aria-hidden />;
}

export { BadgeCheck, ChevronDown, ChevronRight };