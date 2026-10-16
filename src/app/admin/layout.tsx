"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Users, BarChart3, Palette, Settings, LogOut, Sparkles, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Tab = {
  id: string;
  label: string;
  href: string;
  icon: any;
};

const TABS: Tab[] = [
  { id: "users", label: "Utilisateurs", href: "/admin", icon: Users },
  { id: "stats", label: "Statistiques", href: "/admin/stats", icon: BarChart3 },
  { id: "themes", label: "Thèmes", href: "/admin/themes", icon: Palette },
  { id: "settings", label: "Paramètres", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/auth");
        return;
      }
      setUser(session.user);

      const { data: p } = await supabase.from("profiles").select("is_admin").eq("user_id", session.user.id).single();
      if (!p || !p.is_admin) {
        router.replace("/dashboard");
        return;
      }
      setIsAdmin(true);
      setLoading(false);
    })();
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg p-6 animate-pulse">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="h-16 rounded-xl bg-line/70" />
          <div className="h-96 rounded-2xl bg-line/70" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const currentTab = TABS.find((t) => pathname === t.href) || TABS[0];

  return (
    <div className="min-h-screen bg-[#F6F7FB] text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-fractal-terra text-white flex items-center justify-center font-bold text-sm">
              A
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Backoffice Ndeletik</p>
              <p className="text-xs text-muted">Administration</p>
            </div>
          </div>

          <button
            onClick={logout}
            aria-label="Déconnexion"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut size={16} /><span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] sm:px-6 lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8">
        {/* Menu latéral (desktop) */}
        <aside className="hidden lg:block">
          <nav className="sticky top-20 py-6 space-y-1">
            {TABS.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? "bg-fractal-terra/10 text-fractal-terra" : "text-muted hover:bg-soft hover:text-ink"
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Contenu principal */}
        <main className="min-w-0 px-4 py-6 sm:px-0 lg:py-8 pb-24 lg:pb-8">{children}</main>
      </div>

      {/* Barre d'onglets en bas (mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-xl shadow-[0_-8px_30px_rgba(15,23,42,0.06)]">
        <div className="flex justify-around py-2">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive ? "text-fractal-terra" : "text-muted"
                }`}
              >
                <tab.icon size={19} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}