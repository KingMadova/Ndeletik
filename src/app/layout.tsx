import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Ndeletik — Ta bio, tes liens, tes ventes",
    template: "%s — Ndeletik",
  },
  description:
    "La page de liens des créateurs africains : liens illimités, statistiques, paiements Mobile Money et 20 thèmes conçus pour toi.",
  // Pas de `images` ici : les fichiers app/opengraph-image.tsx et app/twitter-image.tsx
  // génèrent automatiquement les images de partage (landing et par profil).
  openGraph: {
    title: "Ndeletik — Ta bio, tes liens, tes ventes",
    description: "Crée ta page de liens unique en 5 minutes. Paiement Mobile Money, stats en temps réel.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ndeletik — Ta bio, tes liens, tes ventes",
    description: "Crée ta page de liens unique en 5 minutes. Paiement Mobile Money, stats en temps réel.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${montserrat.variable} ${poppins.variable}`}>
      <body className="bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}