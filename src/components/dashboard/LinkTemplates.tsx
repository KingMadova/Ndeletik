"use client";

import { useState } from "react";
import { Briefcase, BookOpen, Calendar, Gift, Globe, Mail, MapPin, Phone, ShoppingBag } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaWhatsapp, FaXTwitter, FaYoutube } from "react-icons/fa6";
import type { IconType } from "react-icons";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type LinkTemplate = {
  id: string;
  label: string;
  title: string;
  url: string;
  icon: string;
  Icon: LucideIcon | IconType;
};

const TEMPLATES: LinkTemplate[] = [
  { id: "whatsapp", label: "WhatsApp", title: "Me contacter sur WhatsApp", url: "https://wa.me/", icon: "message", Icon: FaWhatsapp },
  { id: "instagram", label: "Instagram", title: "Mon Instagram", url: "https://instagram.com/", icon: "link", Icon: FaInstagram },
  { id: "tiktok", label: "TikTok", title: "Mon TikTok", url: "https://tiktok.com/@", icon: "link", Icon: FaTiktok },
  { id: "youtube", label: "YouTube", title: "Ma chaîne YouTube", url: "https://youtube.com/@", icon: "link", Icon: FaYoutube },
  { id: "shop", label: "Boutique", title: "Ma boutique en ligne", url: "https://", icon: "bag", Icon: ShoppingBag },
  { id: "website", label: "Site web", title: "Mon site web", url: "https://", icon: "globe", Icon: Globe },
  { id: "booking", label: "Rendez-vous", title: "Réserver un appel", url: "https://calendly.com/", icon: "calendar", Icon: Calendar },
  { id: "course", label: "Formation", title: "Ma formation en ligne", url: "https://", icon: "book", Icon: BookOpen },
  { id: "facebook", label: "Facebook", title: "Ma page Facebook", url: "https://facebook.com/", icon: "link", Icon: FaFacebook },
  { id: "guide", label: "Guide offert", title: "Télécharger mon guide", url: "https://", icon: "gift", Icon: Gift },
  { id: "phone", label: "Appel", title: "M'appeler", url: "tel:+242", icon: "phone", Icon: Phone },
  { id: "email", label: "E-mail", title: "M'envoyer un e-mail", url: "mailto:", icon: "mail", Icon: Mail },
  { id: "location", label: "Adresse", title: "Ma localisation", url: "https://maps.google.com/", icon: "pin", Icon: MapPin },
  { id: "portfolio", label: "Portfolio", title: "Mon portfolio", url: "https://", icon: "briefcase", Icon: Briefcase },
  { id: "twitter", label: "X (Twitter)", title: "Mon compte X", url: "https://x.com/", icon: "link", Icon: FaXTwitter },
  { id: "linkedin", label: "LinkedIn", title: "Mon profil LinkedIn", url: "https://linkedin.com/in/", icon: "link", Icon: FaLinkedin },
];

const VISIBLE = 8;

type Props = {
  /** Dashboard : ouvre le formulaire pré-rempli (le lien reste à compléter). */
  onPick?: (t: LinkTemplate) => void;
  /** Onboarding : ajoute directement le modèle (comportement d'origine). */
  onAdd?: (title: string, url: string, icon: string) => Promise<boolean> | void;
};

/** Modèles d'ajout rapide. */
export function LinkTemplates({ onPick, onAdd }: Props) {
  const [all, setAll] = useState(false);
  const shown = all ? TEMPLATES : TEMPLATES.slice(0, VISIBLE);

  return (
    <section aria-labelledby="quick-add">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 id="quick-add" className="font-display text-sm font-bold text-ink">
            Ajout rapide
          </h2>
          <p className="text-xs text-muted">Choisis un modèle, puis colle ton lien.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setAll((v) => !v)}>
          {all ? "Réduire" : `Voir tout (${TEMPLATES.length})`}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {shown.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => (onPick ? onPick(t) : onAdd?.(t.title, t.url, t.icon))}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:border-fractal-ocre hover:text-fractal-terra"
          >
            <t.Icon size={15} className="text-fractal-ocre" aria-hidden />
            {t.label}
          </button>
        ))}
      </div>
    </section>
  );
}
