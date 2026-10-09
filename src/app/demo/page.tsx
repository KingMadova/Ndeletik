import Link from "next/link";
import { ExternalLink, Sparkles, ArrowLeft } from "lucide-react";
import { FaWhatsapp, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa6";
import { SiShopify } from "react-icons/si";
import { Wordmark } from "@/components/landing/ui";

export const metadata = {
  title: "Page exemple — Ndeletik",
  description: "Découvre à quoi ressemble une page Ndeletik complète : liens, design et boutons officiels.",
};

const demoLinks = [
  { Icon: FaWhatsapp, bg: "#25D366", title: "Commander sur WhatsApp", href: "https://wa.me" },
  { Icon: SiShopify, bg: "#95BF47", title: "Ma boutique en ligne", href: "https://shopify.com" },
  { Icon: FaInstagram, bg: "linear-gradient(45deg,#FEDA75 0%,#FA7E1E 25%,#D62976 50%,#962FBF 75%,#4F5BD5 100%)", title: "Mon Instagram", href: "https://instagram.com" },
  { Icon: FaYoutube, bg: "#FF0000", title: "Ma chaîne YouTube", href: "https://youtube.com" },
  { Icon: FaTiktok, bg: "#010101", title: "Mon TikTok", href: "https://tiktok.com" },
];

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-bg relative overflow-hidden">
      {/* Décor fractal clair */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-fractal-or/20 rounded-full blur-3xl" />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] border border-fractal-ocre/10 rounded-full" />
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[450px] h-[450px] border border-fractal-ocre/15 rounded-full" />
      </div>

      <header className="relative z-20 flex items-center justify-between px-4 py-4">
        <Link href="/">
          <Wordmark />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fractal-terra transition-colors"
        >
          <ArrowLeft size={14} /> Accueil
        </Link>
      </header>

      {/* Bandeau démo */}
      <div className="relative z-20 mx-auto max-w-lg px-4">
        <div className="flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-xs text-muted shadow-soft">
          <Sparkles size={12} className="text-fractal-ocre" />
          Page de démonstration — données fictives
        </div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-8 pb-24">
        {/* Profil fictif */}
        <header className="text-center">
          <div className="relative w-28 h-28 mx-auto mb-5">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-fractal-or via-fractal-ocre to-fractal-terra opacity-90 blur-[2px]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=240&q=80"
              alt="Photo de démonstration"
              className="relative w-28 h-28 rounded-full object-cover border-4 border-bg"
            />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-ink">@awa.demo</h1>
          <p className="mt-3 text-muted leading-relaxed">
            Créatrice de contenu · Coaching & beauté 🌍
            <br />
            Voici à quoi ressemble ta page Ndeletik.
          </p>
        </header>

        {/* Liens fictifs avec vraies icônes */}
        <section className="mt-10 space-y-4" aria-label="Liens de démonstration">
          {demoLinks.map((l, i) => (
            <a
              key={l.title}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-4 bg-surface border border-line rounded-2xl px-6 py-4 shadow-soft hover:border-fractal-ocre/60 transition-colors overflow-hidden"
              style={{ transitionDelay: `${i * 20}ms` }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-fractal-or via-fractal-ocre to-fractal-terra opacity-0 group-hover:opacity-100 transition-opacity" />
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-soft"
                style={{ background: l.bg }}
              >
                <l.Icon size={18} />
              </span>
              <span className="font-medium text-ink group-hover:text-fractal-terra transition-colors flex-1">
                {l.title}
              </span>
              <ExternalLink
                size={18}
                className="text-muted group-hover:text-fractal-ocre transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          ))}
        </section>

        {/* CTA final */}
        <footer className="mt-16 text-center">
          <p className="text-sm text-muted mb-4">Cette page pourrait être la tienne en 5 minutes.</p>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-bg shadow-lg transition hover:opacity-90"
          >
            Créer ma page gratuite
          </Link>
        </footer>
      </div>
    </main>
  );
}