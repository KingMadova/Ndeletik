import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/landing/ui";
import { DemoLinks } from "@/components/demo/DemoLinks";

export const metadata = {
  title: "Page exemple",
  description: "Découvre à quoi ressemble une page Ndeletik complète : liens, design et boutons officiels.",
};

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
            <div
              aria-hidden="true"
              className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-bg bg-gradient-to-br from-fractal-or to-fractal-terra font-display text-4xl font-extrabold text-white"
            >
              A
            </div>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-ink">@awa.demo</h1>
          <p className="mt-3 text-muted leading-relaxed">
            Créatrice de contenu · Coaching & beauté 🌍
            <br />
            Voici à quoi ressemble ta page Ndeletik.
          </p>
        </header>

        <DemoLinks />

        {/* CTA final */}
        <footer className="mt-16 text-center">
          <p className="text-sm text-muted mb-4">Cette page pourrait être la tienne en 5 minutes.</p>
          <Link
            href="/auth?mode=signup"
            className="inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-bg shadow-lg transition hover:opacity-90"
          >
            Créer ma page gratuite
          </Link>
        </footer>
      </div>
    </main>
  );
}