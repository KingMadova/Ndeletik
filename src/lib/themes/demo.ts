import type { Profile } from "./types";

/**
 * Profil de démonstration servi statiquement sur /@demo.
 * Il showcase les nouveaux blocs : hint, offer (widget date + icône + CTA),
 * contact, separator, newsletter — sur un thème Business (banners).
 */
export const DEMO_PROFILE: Profile = {
  slug: "demo",
  displayName: "Barbearia Premium",
  headline: "Coupe • Barbe • Style",
  bio: "Page de démonstration Ndeletik : offres, contact, séparateurs et newsletter, rendus par le même moteur que ta page.",
  verified: true,
  showBadge: true,
  themeId: "barbier",
  socials: [
    { type: "instagram", url: "https://instagram.com/" },
    { type: "whatsapp", url: "https://wa.me/" },
    { type: "youtube", url: "https://youtube.com/" },
    { type: "email", url: "mailto:demo@ndeletik.com" },
  ],
  links: [
    { id: "d1", title: "Mon WhatsApp", subtitle: "Réponse rapide", url: "https://wa.me/", icon: "message", featured: true, cta: "Écrire" },
    { id: "d2", title: "Mon Instagram", subtitle: "Coups de ciseaux quotidiens", url: "https://instagram.com/", icon: "link", cta: "Suivre" },
    { id: "d3", title: "Ma boutique", subtitle: "Produits et soins", url: "https://shopify.com/", icon: "bag", cta: "Voir" },
    { id: "d4", title: "Ma formation", subtitle: "Devenir barbier pro", url: "https://youtube.com/", icon: "book", cta: "Découvrir" },
  ],
  blocks: [
    { type: "hint", emoji: "👆", label: "Clique sur mes offres" },
    {
      type: "offer",
      tag: "Aulas Presenciais",
      title: "WORKSHOP de Barbearia",
      desc: "Formation intensive le week-end",
      dateLabel: "Dia",
      dateValue: "10",
      cta: "VAGAS →",
      url: "https://wa.me/",
    },
    {
      type: "offer",
      title: "Réserver un créneau",
      desc: "Coupe + barbe, 45 minutes",
      icon: "calendar",
      cta: "AGENDE",
      url: "https://calendly.com/",
    },
    {
      type: "contact",
      emoji: "💈",
      title: "Estamos esperando por você !",
      text: "RUA ALEGRE, 125 — Pointe-Noire",
      url: "https://maps.google.com/",
    },
    { type: "separator", label: "Conecte-se" },
    { type: "newsletter", title: "Rejoins ma newsletter", subtitle: "Conseils et actualités chaque semaine." },
  ],
};