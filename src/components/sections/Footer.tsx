import { Sparkles } from "lucide-react";
import { config } from "@/lib/config";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-savane-dark border-t border-savane-border py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-fractal-ocre to-fractal-terra rounded-lg flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="text-2xl font-display font-bold text-white">
                {config.brand}
              </span>
            </Link>
            <p className="text-gray-400 max-w-sm mb-4">
              La page de liens nouvelle génération pour les créateurs africains. Inspiré par les fractales, conçu pour l'excellence.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Produit</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="#features" className="hover:text-fractal-ocre transition-colors">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-fractal-ocre transition-colors">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link href="/api" className="hover:text-fractal-ocre transition-colors">
                  API
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Entreprise</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="#" className="hover:text-fractal-ocre transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-fractal-ocre transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-fractal-ocre transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-savane-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} {config.brand}. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-gray-500 hover:text-fractal-ocre transition-colors">
              Confidentialité
            </Link>
            <Link href="#" className="text-gray-500 hover:text-fractal-ocre transition-colors">
              Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}