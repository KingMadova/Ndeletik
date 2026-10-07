import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F1115",
};

export const metadata: Metadata = {
  title: "Ndeletik | Tes liens, ton héritage",
  description:
    "La page de liens nouvelle génération, inspirée par l'élégance des fractales africaines.",
  openGraph: {
    title: "Ndeletik | Tes liens, ton héritage",
    description: "La page de liens nouvelle génération pour les créateurs africains",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased min-h-screen bg-savane-dark text-white`}
      >
        {children}
      </body>
    </html>
  );
}