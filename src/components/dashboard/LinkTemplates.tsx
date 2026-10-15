"use client";

import { motion } from "framer-motion";
import { Globe, ShoppingBag, MessageCircle, Calendar, BookOpen, Gift, Phone, Mail, MapPin, Briefcase } from "lucide-react";
import { FaInstagram, FaTiktok, FaYoutube, FaFacebook, FaWhatsapp, FaXTwitter, FaLinkedin } from "react-icons/fa6";

type Template = {
  id: string;
  title: string;
  url: string;
  icon: string;
  color: string;
  Icon: any;
};

const TEMPLATES: Template[] = [
  { id: "website", title: "Mon site web", url: "https://", icon: "globe", color: "from-blue-500 to-blue-600", Icon: Globe },
  { id: "shop", title: "Ma boutique en ligne", url: "https://", icon: "bag", color: "from-purple-500 to-purple-600", Icon: ShoppingBag },
  { id: "whatsapp", title: "Me contacter sur WhatsApp", url: "https://wa.me/", icon: "message", color: "from-green-500 to-green-600", Icon: FaWhatsapp },
  { id: "booking", title: "Réserver un appel", url: "https://calendly.com/", icon: "calendar", color: "from-indigo-500 to-indigo-600", Icon: Calendar },
  { id: "course", title: "Ma formation en ligne", url: "https://", icon: "book", color: "from-orange-500 to-orange-600", Icon: BookOpen },
  { id: "guide", title: "Télécharger mon guide", url: "https://", icon: "gift", color: "from-pink-500 to-pink-600", Icon: Gift },
  { id: "phone", title: "M'appeler", url: "tel:+242", icon: "phone", color: "from-teal-500 to-teal-600", Icon: Phone },
  { id: "email", title: "M'envoyer un email", url: "mailto:", icon: "mail", color: "from-red-500 to-red-600", Icon: Mail },
  { id: "location", title: "Ma localisation", url: "https://maps.google.com/", icon: "pin", color: "from-yellow-500 to-yellow-600", Icon: MapPin },
  { id: "portfolio", title: "Mon portfolio", url: "https://", icon: "briefcase", color: "from-gray-700 to-gray-800", Icon: Briefcase },
  { id: "instagram", title: "Mon Instagram", url: "https://instagram.com/", icon: "link", color: "from-pink-500 via-red-500 to-yellow-500", Icon: FaInstagram },
  { id: "tiktok", title: "Mon TikTok", url: "https://tiktok.com/@", icon: "link", color: "from-black to-gray-800", Icon: FaTiktok },
  { id: "youtube", title: "Ma chaîne YouTube", url: "https://youtube.com/@", icon: "link", color: "from-red-600 to-red-700", Icon: FaYoutube },
  { id: "facebook", title: "Ma page Facebook", url: "https://facebook.com/", icon: "link", color: "from-blue-600 to-blue-700", Icon: FaFacebook },
  { id: "twitter", title: "Mon compte X (Twitter)", url: "https://x.com/", icon: "link", color: "from-gray-800 to-black", Icon: FaXTwitter },
  { id: "linkedin", title: "Mon profil LinkedIn", url: "https://linkedin.com/in/", icon: "link", color: "from-blue-700 to-blue-800", Icon: FaLinkedin },
];

type Props = {
  onAdd: (title: string, url: string, icon: string) => Promise<boolean>;
};

export function LinkTemplates({ onAdd }: Props) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold mb-3 text-muted">Ajout rapide</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {TEMPLATES.map((t, i) => (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              const success = await onAdd(t.title, t.url, t.icon);
              if (success) {
                // Animation de succès
              }
            }}
            className="group relative overflow-hidden rounded-2xl border border-line bg-surface p-4 text-left transition-shadow hover:shadow-soft"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${t.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${t.color} text-white shadow-soft`}>
              <t.Icon size={20} />
            </div>
            <p className="text-sm font-semibold text-ink line-clamp-2">{t.title}</p>
            <p className="mt-1 text-xs text-muted truncate">{t.url.replace(/^https?:\/\//, "")}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}