import {
  BadgeCheck, BookOpen, Briefcase, Calendar, ChevronDown, ChevronRight, Dumbbell, FileText, Gift, Globe,
  Heart, Image as ImgIcon, Leaf, Link2, Mail, MapPin, MessageCircle, Phone, Play, Scale, ShoppingBag, Star, Tag, Users,
  type LucideIcon,
} from "lucide-react";
import type { IconType } from "react-icons";
import {
  FaEnvelope, FaFacebookF, FaInstagram, FaLinkedinIn, FaPinterestP, FaTelegram, FaTiktok, FaWhatsapp, FaXTwitter, FaYoutube,
} from "react-icons/fa6";
import type { SocialType } from "@/lib/themes/types";

export const LINK_ICONS: Record<string, LucideIcon> = {
  link: Link2, calendar: Calendar, file: FileText, image: ImgIcon, pin: MapPin, message: MessageCircle,
  bag: ShoppingBag, heart: Heart, gift: Gift, dumbbell: Dumbbell, mail: Mail, globe: Globe, phone: Phone,
  star: Star, tag: Tag, users: Users, leaf: Leaf, play: Play, book: BookOpen, briefcase: Briefcase, scale: Scale,
};

const SOCIAL_ICONS: Record<SocialType, IconType> = {
  instagram: FaInstagram, tiktok: FaTiktok, youtube: FaYoutube, facebook: FaFacebookF, whatsapp: FaWhatsapp,
  x: FaXTwitter, linkedin: FaLinkedinIn, telegram: FaTelegram, pinterest: FaPinterestP, email: FaEnvelope,
};

export function LinkIcon({ name, size = 18 }: { name?: string; size?: number }) {
  const I = (name && LINK_ICONS[name]) || Link2;
  return <I size={size} aria-hidden />;
}

export function SocialIcon({ type }: { type: SocialType }) {
  const I = SOCIAL_ICONS[type];
  return <I aria-hidden />;
}

export { BadgeCheck, ChevronDown, ChevronRight };