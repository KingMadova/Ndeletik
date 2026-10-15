import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const poppins = Poppins({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-poppins" });

export const metadata: Metadata = {
  title: { default: "Ndeletik — Ta bio, tes liens, tes ventes", template: "%s — Ndeletik" },
  description:
    "La page de liens des créateurs africains : liens illimités, statistiques, paiements Mobile Money et 18 thèmes diseñés pour toi.",
  openGraph: {
    title: "Ndeletik — Ta bio, tes liens, tes ventes",
    description: "Crée ta page de liens unique en 5 minutes. Paiement Mobile Money, stats en temps réel.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${montserrat.variable} ${poppins.variable}`}>
      <body className="bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}