import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-fractal-or via-fractal-ocre to-fractal-terra rounded-2xl flex items-center justify-center mb-6 shadow-soft">
        <Compass size={32} className="text-white" />
      </div>
      <h1 className="text-4xl md:text-5xl font-display font-extrabold text-ink mb-4">
        Page introuvable
      </h1>
      <p className="text-muted max-w-md mb-8">
        Ce profil n&apos;existe pas ou a été déplacé. Vérifie l&apos;orthographe du nom d&apos;utilisateur.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="px-6 h-10 inline-flex items-center rounded-full bg-ink text-bg font-medium hover:opacity-90 transition"
        >
          Accueil
        </Link>
        <Link
          href="/dashboard"
          className="px-6 h-10 inline-flex items-center rounded-full border border-line text-muted hover:border-fractal-ocre hover:text-fractal-terra transition"
        >
          Mon dashboard
        </Link>
      </div>
    </main>
  );
}