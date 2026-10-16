import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const poppins = Poppins({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-poppins" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ndeletik.vercel.app";
const TITLE = "Ndeletik — Ta bio, tes liens, tes ventes";
const DESCRIPTION =
  "La page de liens des créateurs africains : liens illimités, statistiques, paiements Mobile Money et 18 thèmes conçus pour toi.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s — Ndeletik" },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: "Crée ta page de liens unique en 5 minutes. Paiement Mobile Money, stats en temps réel.",
    type: "website",
    siteName: "Ndeletik",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
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