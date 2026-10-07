import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-savane-dark flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-fractal-ocre to-fractal-terra rounded-2xl flex items-center justify-center mb-6">
        <Compass size={32} className="text-white" />
      </div>
      <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
        Page introuvable
      </h1>
      <p className="text-gray-400 max-w-md mb-8">
        Ce profil n&apos;existe pas ou a été déplacé. Vérifie l&apos;orthographe du nom d&apos;utilisateur.
      </p>
      <Link
        href="/"
        className="px-6 h-10 inline-flex items-center rounded-full bg-white text-savane-dark font-medium hover:bg-fractal-ocre hover:text-white transition-colors"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}