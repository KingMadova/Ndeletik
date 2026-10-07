"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Check, ExternalLink, Sparkles } from "lucide-react";
import type { Profile, LinkItem } from "@/lib/types";

interface Props {
  profile: Profile;
  links: LinkItem[];
}

export function PublicProfile({ profile, links }: Props) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponible
    }
  };

  const trackClick = (linkId: string) => {
    // Fire-and-forget : on ne bloque pas la navigation
    fetch("/api/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkId }),
    }).catch(() => {});
  };

  return (
    <main className="min-h-screen bg-savane-dark relative overflow-hidden">
      {/* ===== Décor fractal ===== */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-fractal-ocre/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-fractal-terra/10 rounded-full blur-3xl" />
        {/* Anneaux concentriques (clin d'œil aux villages Ba-Ila) */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] border border-fractal-ocre/5 rounded-full" />
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[450px] h-[450px] border border-fractal-ocre/10 rounded-full" />
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[300px] h-[300px] border border-fractal-ocre/15 rounded-full" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-16 pb-24">
        {/* ===== En-tête profil ===== */}
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="relative w-28 h-28 mx-auto mb-5">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-fractal-ocre via-fractal-terra to-fractal-or opacity-80 blur-[2px]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
              alt={`Photo de ${profile.username}`}
              className="relative w-28 h-28 rounded-full object-cover border-4 border-savane-dark"
            />
          </div>

          <h1 className="text-3xl font-display font-bold text-white">
            @{profile.username}
          </h1>

          {profile.bio && (
            <p className="mt-3 text-gray-400 leading-relaxed">{profile.bio}</p>
          )}

          <button
            onClick={copyLink}
            className="mt-5 inline-flex items-center gap-2 px-5 h-10 rounded-full bg-white/5 border border-savane-border text-sm text-gray-300 hover:border-fractal-ocre hover:text-fractal-ocre transition-colors"
            aria-label="Copier le lien de la page"
          >
            {copied ? (
              <Check size={16} className="text-fractal-ocre" />
            ) : (
              <Share2 size={16} />
            )}
            {copied ? "Lien copié !" : "Partager"}
          </button>
        </motion.header>

        {/* ===== Liens ===== */}
        <section className="mt-10 space-y-4" aria-label="Liens">
          {links.map((link, i) => (
            <motion.a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick(link.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 + i * 0.08 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex items-center justify-between bg-white/[0.03] backdrop-blur-xl border border-savane-border rounded-2xl px-6 py-4 hover:border-fractal-ocre/60 transition-colors overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-fractal-ocre to-fractal-terra opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="font-medium text-white group-hover:text-fractal-or transition-colors">
                {link.title}
              </span>
              <ExternalLink
                size={18}
                className="text-gray-500 group-hover:text-fractal-ocre transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </motion.a>
          ))}

          {links.length === 0 && (
            <p className="text-center text-gray-500 py-12">
              Aucun lien pour le moment.
            </p>
          )}
        </section>

        {/* ===== Boucle de croissance ===== */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-fractal-ocre transition-colors"
          >
            <Sparkles size={14} className="text-fractal-ocre" />
            Créé avec <span className="font-semibold text-gray-300">Ndeletik</span> — crée ta page
          </a>
        </motion.footer>
      </div>
    </main>
  );
}