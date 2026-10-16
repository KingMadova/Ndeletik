import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Statistiques",
  description: "Clics, sources de trafic et pays de tes visiteurs.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
