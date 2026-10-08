import type { IconType } from "react-icons";
import {
  FaAmazon, FaApple, FaBehance, FaBitcoin, FaDiscord, FaDribbble, FaDropbox, FaEbay,
  FaEnvelope, FaEthereum, FaFacebookF, FaFigma, FaGithub, FaGitlab, FaGlobe, FaGoogle,
  FaInstagram, FaLine, FaLinkedinIn, FaLocationDot, FaMedium, FaPaypal,
  FaPhone, FaPinterestP, FaPodcast, FaQuora, FaReddit, FaSkype, FaSlack, FaSnapchat,
  FaSoundcloud, FaSpotify, FaSteam, FaTelegram, FaTiktok, FaTumblr, FaTwitch, FaVimeo,
  FaVk, FaWeibo, FaWeixin, FaWhatsapp, FaXTwitter, FaYoutube,
} from "react-icons/fa6";
import {
  SiBluesky, SiCalendly, SiEtsy, SiFramer, SiGumroad, SiKofi, SiLinktree, SiMastodon,
  SiNetlify, SiNotion, SiPatreon, SiShopify, SiSignal, SiSquarespace, SiStripe,
  SiSubstack, SiThreads, SiVercel, SiWebflow, SiWix, SiWordpress, SiZoom,
} from "react-icons/si";

export type BlockMeta = { Icon: IconType; bg: string };

export function normalizeUrl(raw: string) {
  const v = raw.trim();
  if (/^(https?:\/\/|mailto:|tel:)/i.test(v)) return v;
  if (v.includes("@") && !v.includes("/")) return `mailto:${v}`;
  return `https://${v}`;
}

export function getBlockMeta(url: string): BlockMeta {
  const u = url.toLowerCase();

  // ===== Messageries =====
  if (u.includes("wa.me") || u.includes("whatsapp")) return { Icon: FaWhatsapp, bg: "bg-[#25D366]" };
  if (u.includes("telegram") || u.includes("t.me")) return { Icon: FaTelegram, bg: "bg-[#26A5E4]" };
  if (u.includes("discord")) return { Icon: FaDiscord, bg: "bg-[#5865F2]" };
  if (u.includes("slack")) return { Icon: FaSlack, bg: "bg-[#4A154B]" };
  if (u.includes("skype")) return { Icon: FaSkype, bg: "bg-[#00AFF0]" };
  if (u.includes("signal.org") || u.includes("signal.me")) return { Icon: SiSignal, bg: "bg-[#3A76F0]" };
  if (u.includes("line.me") || u.includes("line.app")) return { Icon: FaLine, bg: "bg-[#06C755]" };
  if (u.includes("weixin") || u.includes("wechat")) return { Icon: FaWeixin, bg: "bg-[#07C160]" };

  // ===== Réseaux sociaux =====
  if (u.includes("instagram")) return { Icon: FaInstagram, bg: "bg-[linear-gradient(45deg,#FEDA75_0%,#FA7E1E_25%,#D62976_50%,#962FBF_75%,#4F5BD5_100%)]" };
  if (u.includes("tiktok")) return { Icon: FaTiktok, bg: "bg-[#010101]" };
  if (u.includes("facebook") || u.includes("fb.com") || u.includes("fb.me")) return { Icon: FaFacebookF, bg: "bg-[#1877F2]" };
  if (/(^|[\/.])x\.com/.test(u) || u.includes("twitter")) return { Icon: FaXTwitter, bg: "bg-[#000000]" };
  if (u.includes("threads.net") || u.includes("threads.com")) return { Icon: SiThreads, bg: "bg-[#000000]" };
  if (u.includes("bluesky")) return { Icon: SiBluesky, bg: "bg-[#0085FF]" };
  if (u.includes("mastodon")) return { Icon: SiMastodon, bg: "bg-[#6364FF]" };
  if (u.includes("linkedin")) return { Icon: FaLinkedinIn, bg: "bg-[#0A66C2]" };
  if (u.includes("snapchat")) return { Icon: FaSnapchat, bg: "bg-[#FFFC00]" };
  if (u.includes("pinterest")) return { Icon: FaPinterestP, bg: "bg-[#E60023]" };
  if (u.includes("reddit")) return { Icon: FaReddit, bg: "bg-[#FF4500]" };
  if (u.includes("quora")) return { Icon: FaQuora, bg: "bg-[#B92B27]" };
  if (u.includes("tumblr")) return { Icon: FaTumblr, bg: "bg-[#001935]" };
  if (u.includes("vk.com")) return { Icon: FaVk, bg: "bg-[#0077FF]" };
  if (u.includes("weibo")) return { Icon: FaWeibo, bg: "bg-[#E6162D]" };
  if (u.includes("linktree")) return { Icon: SiLinktree, bg: "bg-[#39E09B]" };

  // ===== Vidéo & streaming =====
  if (u.includes("youtu")) return { Icon: FaYoutube, bg: "bg-[#FF0000]" };
  if (u.includes("vimeo")) return { Icon: FaVimeo, bg: "bg-[#1AB7EA]" };
  if (u.includes("twitch")) return { Icon: FaTwitch, bg: "bg-[#9146FF]" };
  if (u.includes("steam")) return { Icon: FaSteam, bg: "bg-[#171A21]" };

  // ===== Musique & audio =====
  if (u.includes("spotify")) return { Icon: FaSpotify, bg: "bg-[#1DB954]" };
  if (u.includes("soundcloud")) return { Icon: FaSoundcloud, bg: "bg-[#FF5500]" };
  if (u.includes("podcast")) return { Icon: FaPodcast, bg: "bg-[#9936E5]" };

  // ===== Création & portfolio =====
  if (u.includes("behance")) return { Icon: FaBehance, bg: "bg-[#1769FF]" };
  if (u.includes("dribbble")) return { Icon: FaDribbble, bg: "bg-[#EA4C89]" };
  if (u.includes("figma")) return { Icon: FaFigma, bg: "bg-[#F24E1E]" };
  if (u.includes("medium")) return { Icon: FaMedium, bg: "bg-[#000000]" };
  if (u.includes("substack")) return { Icon: SiSubstack, bg: "bg-[#FF6719]" };
  if (u.includes("notion")) return { Icon: SiNotion, bg: "bg-[#000000]" };

  // ===== Business, boutique & paiement =====
  if (u.includes("shopify")) return { Icon: SiShopify, bg: "bg-[#95BF47]" };
  if (u.includes("stripe")) return { Icon: SiStripe, bg: "bg-[#635BFF]" };
  if (u.includes("paypal")) return { Icon: FaPaypal, bg: "bg-[#003087]" };
  if (u.includes("amazon")) return { Icon: FaAmazon, bg: "bg-[#FF9900]" };
  if (u.includes("ebay")) return { Icon: FaEbay, bg: "bg-[#E53238]" };
  if (u.includes("etsy")) return { Icon: SiEtsy, bg: "bg-[#F1641E]" };
  if (u.includes("gumroad")) return { Icon: SiGumroad, bg: "bg-[#FF90E8]" };
  if (u.includes("ko-fi") || u.includes("kofi")) return { Icon: SiKofi, bg: "bg-[#FF5E5B]" };
  if (u.includes("patreon")) return { Icon: SiPatreon, bg: "bg-[#FF424D]" };
  if (u.includes("bitcoin")) return { Icon: FaBitcoin, bg: "bg-[#F7931A]" };
  if (u.includes("ethereum")) return { Icon: FaEthereum, bg: "bg-[#627EEA]" };

  // ===== Dev & web =====
  if (u.includes("github")) return { Icon: FaGithub, bg: "bg-[#181717]" };
  if (u.includes("gitlab")) return { Icon: FaGitlab, bg: "bg-[#FC6D26]" };
  if (u.includes("vercel")) return { Icon: SiVercel, bg: "bg-[#000000]" };
  if (u.includes("netlify")) return { Icon: SiNetlify, bg: "bg-[#00C7B7]" };
  if (u.includes("webflow")) return { Icon: SiWebflow, bg: "bg-[#4353FF]" };
  if (u.includes("framer")) return { Icon: SiFramer, bg: "bg-[#0055FF]" };
  if (u.includes("wix.com")) return { Icon: SiWix, bg: "bg-[#0C6EFC]" };
  if (u.includes("squarespace")) return { Icon: SiSquarespace, bg: "bg-[#000000]" };
  if (u.includes("wordpress")) return { Icon: SiWordpress, bg: "bg-[#21759B]" };

  // ===== Outils & rendez-vous =====
  if (u.includes("calendly")) return { Icon: SiCalendly, bg: "bg-[#006BFF]" };
  if (u.includes("zoom")) return { Icon: SiZoom, bg: "bg-[#0B5CFF]" };
  if (u.includes("drive.google") || u.includes("docs.google")) return { Icon: FaDropbox, bg: "bg-[#0061FF]" };
  if (u.includes("dropbox")) return { Icon: FaDropbox, bg: "bg-[#0061FF]" };
  if (u.includes("maps.google") || u.includes("google.maps")) return { Icon: FaLocationDot, bg: "bg-[#4285F4]" };
  if (u.includes("google")) return { Icon: FaGoogle, bg: "bg-[#4285F4]" };
  if (u.includes("apple")) return { Icon: FaApple, bg: "bg-[#000000]" };

  // ===== Contacts =====
  if (u.startsWith("mailto:")) return { Icon: FaEnvelope, bg: "bg-[#EA4335]" };
  if (u.startsWith("tel:")) return { Icon: FaPhone, bg: "bg-[#18181B]" };

  // ===== Fallback : site web =====
  return { Icon: FaGlobe, bg: "bg-[#FF6A1A]" };
}