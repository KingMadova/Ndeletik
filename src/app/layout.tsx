import type { Metadata, Viewport } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFF9F3",
};

export const metadata: Metadata = {
  title: "Ndeletik — Tes liens, ton héritage",
  description: "La page de liens nouvelle génération pour les créateurs africains. Simple, élégante, conçue pour le Mobile Money.",
  openGraph: {
    title: "Ndeletik — Tes liens, ton héritage",
    description: "La page de liens nouvelle génération pour les créateurs africains.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={montserrat.variable + " " + poppins.variable}>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}