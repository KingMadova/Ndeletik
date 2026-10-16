import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion et inscription",
  description: "Connecte-toi ou crée ta page de liens Ndeletik gratuitement.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
