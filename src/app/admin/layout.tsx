import type { Metadata } from "next";
import { AdminProvider } from "@/components/admin/AdminProvider";
import { AdminShell } from "@/components/admin/AdminShell";

<<<<<<< HEAD
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Users, BarChart3, Palette, Settings, LogOut, AlertTriangle, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Tab = {
  id: string;
  label: string;
  href: string;
  icon: any;
=======
export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
>>>>>>> origin/master
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
<<<<<<< HEAD
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const checkAccess = async () => {
    setLoading(true);
    setAccessError("");
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error(`Impossible de vérifier la session : ${sessionError.message}`);
      if (!session) {
        setUser(null);
        setIsAdmin(false);
        setAccessError("Vous n'êtes pas connecté. Connectez-vous avec le compte administrateur.");
        return;
      }
      setUser(session.user);

      // La page admin utilise accounts.role : le layout doit appliquer la même règle.
      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (accountError) {
        throw new Error(`Impossible de vérifier votre rôle administrateur : ${accountError.message}`);
      }
      if (!account) {
        setIsAdmin(false);
        setAccessError("Aucun profil de compte n'a été trouvé pour cette session. Vérifiez que le compte est bien initialisé.");
        return;
      }
      if (account.role !== "admin") {
        setIsAdmin(false);
        setAccessError(`Accès refusé : le rôle associé à ce compte est « ${account.role ?? "non défini"} », alors que « admin » est requis.`);
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      setIsAdmin(false);
      setAccessError(error instanceof Error ? error.message : "Une erreur inconnue empêche la vérification des droits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void checkAccess();
    // checkAccess is intentionally run on mount; retry is triggered by the button below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setAccessError("");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/auth?mode=login");
      router.refresh();
    } catch {
      setAccessError("La déconnexion n’a pas abouti. Vérifiez votre connexion puis réessayez.");
      setLoggingOut(false);
    }
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
    return (
      <div className="min-h-screen bg-[#F6F7FB] px-4 py-10 text-slate-900">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <AlertTriangle size={23} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Backoffice Ndeletik</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Accès au dashboard impossible</h1>
          <p role="alert" className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            {accessError || "Les droits d'accès n'ont pas pu être confirmés."}
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Aucun écran d'administration n'a été chargé. Réessayez la vérification ; si le problème persiste, le message ci-dessus indique la catégorie du blocage.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void checkAccess()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <RefreshCw size={16} /> Réessayer
            </button>
            <button
              type="button"
              onClick={() => router.push(user ? "/dashboard" : "/auth?mode=login")}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {user ? "Retour au tableau de bord" : "Se connecter"}
            </button>
          </div>
          {user && <p className="mt-5 break-all text-xs text-slate-400">Session détectée : {user.email ?? user.id}</p>}
        </div>
      </div>
    );
  }

  const currentTab = TABS.find((t) => pathname === t.href) || TABS[0];

  return (
    <div className="min-h-screen bg-[#F6F7FB] text-slate-900">
      {accessError && <p role="alert" className="mx-auto mt-4 max-w-4xl rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{accessError}</p>}

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
            onClick={() => void logout()}
            disabled={loggingOut}
            aria-label="Déconnexion"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:cursor-wait disabled:opacity-60"
          >
            <LogOut size={16} /><span className="hidden sm:inline">{loggingOut ? "Déconnexion…" : "Déconnexion"}</span>
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
=======
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
>>>>>>> origin/master
  );
}
