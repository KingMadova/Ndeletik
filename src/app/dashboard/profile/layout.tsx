import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil",
  description: "Photo, bannière et informations de ta page.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
