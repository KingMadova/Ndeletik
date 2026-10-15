import type { Profile } from "./types";

export const SAMPLE_PROFILE: Profile = {
  slug: "demo", displayName: "Coach Exemple", headline: "Business · Mindset · Croissance",
  bio: "J'aide les entrepreneurs à structurer leur activité et à passer à l'action.", verified: true, themeId: "fallback",
  socials: [{ type: "instagram", url: "#" }, { type: "tiktok", url: "#" }, { type: "youtube", url: "#" }, { type: "whatsapp", url: "#" }, { type: "email", url: "#" }],
  links: [
    { id: "1", title: "Réserver un appel", subtitle: "30 minutes pour faire le point", url: "#", icon: "calendar", featured: true, cta: "Réserver" },
    { id: "2", title: "Ma formation", subtitle: "Le programme complet en ligne", url: "#", icon: "book", cta: "Découvrir" },
    { id: "3", title: "Guide gratuit", subtitle: "Checklist à télécharger", url: "#", icon: "gift", cta: "Télécharger" },
    { id: "4", title: "Me contacter sur WhatsApp", subtitle: "Réponse rapide", url: "#", icon: "message", cta: "Écrire" },
    { id: "5", title: "Ma boutique", subtitle: "Produits et services", url: "#", icon: "bag", cta: "Voir" },
    { id: "6", title: "Localisation", subtitle: "Pointe-Noire", url: "#", icon: "pin", cta: "Itinéraire" },
  ],
  blocks: [
    { type: "stats", items: [{ value: "500+", label: "Clients" }, { value: "8 ans", label: "d'expérience" }, { value: "95%", label: "Satisfaits" }] },
    { type: "about", title: "À propos", text: "Texte de présentation de démonstration. Remplace-le par ta propre histoire." },
    { type: "faq", items: [{ q: "Comment ça marche ?", a: "Réponse d'exemple." }, { q: "Est-ce disponible en ligne ?", a: "Réponse d'exemple." }] },
    { type: "newsletter", title: "Rejoins ma newsletter", subtitle: "Conseils et actualités chaque semaine." },
  ],
};