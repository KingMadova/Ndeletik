"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Reorder, motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  LogOut, Plus, Link2, Eye, User, Palette, BarChart3, SwatchBook, TrendingUp, Globe, Download, LayoutList,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { LinkItem as LinkItemType, Profile } from "@/lib/types";
import { LinkItem } from "@/components/dashboard/LinkItem";
import { ProfileCard, Banner } from "@/components/dashboard/ProfileCard";
import { AddBlockModal } from "@/components/dashboard/AddBlockModal";
import { LinkTemplates } from "@/components/dashboard/LinkTemplates";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { LinkAnalyticsModal } from "@/components/dashboard/LinkAnalyticsModal";
import { useToast } from "@/components/dashboard/Toast";
import { normalizeUrl } from "@/components/dashboard/blockMeta";
import { UploadButton } from "@/components/dashboard/UploadButton";
import { ShortLinkManager } from "@/components/dashboard/ShortLinkManager";
import { OfflineBanner } from "@/components/dashboard/OfflineBanner";
import { COUNTRY_GROUPS } from "@/lib/countries";
import { isReserved } from "@/lib/reserved";

const WorldMap = dynamic(
  () => import("@/components/admin/WorldMap").then((m) => m.WorldMap),
  { ssr: false, loading: () => <div className="h-64 rounded-xl bg-soft animate-pulse" /> }
);

const btnPrimary =
  "bg-fractal-ocre hover:bg-fractal-terra text-white font-semibold transition-colors shadow-soft";

type Tab = "lynk" | "appearance" | "statistic";
const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "lynk", label: "Liens", icon: Link2 },
  { id: "appearance", label: "Apparence", icon: Palette },
  { id: "statistic", label: "Statistiques", icon: BarChart3 },
];

type TrafficSource = { name: string; count: number; percentage: number };
type CountryMarker = { lat: number; lon: number; plan: string; count: number; country: string };

const COUNTRY_COORDS: Record<string, [number, number]> = {
  FR: [46.6, 2.2], US: [37.0, -95.7], GB: [55.3, -3.4], DE: [51.1, 10.4],
  ES: [40.4, -3.7], IT: [41.8, 12.5], BE: [50.5, 4.4], CH: [46.8, 8.2],
  CA: [56.1, -106.3], CG: [-0.2, 15.8], CD: [-2.9, 23.7], CM: [7.3, 12.3],
  CI: [7.5, -5.5], SN: [14.4, -14.4], ML: [17.5, -4.0], BF: [12.2, -1.6],
  MA: [31.7, -7.0], TN: [33.8, 9.7], DZ: [28.0, 1.6], GA: [-0.8, 11.6],
  NG: [9.1, 8.7], ZA: [-30.6, 22.9], BR: [-14.2, -51.9], PT: [39.4, -8.2],
};

export default function Dashboard() {
  const router = useRouter();
  const { toast, node: toastNode } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<LinkItemType[]>([]);
  const [plan, setPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("lynk");
  const [modal, setModal] = useState(false);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [markers, setMarkers] = useState<CountryMarker[]>([]);
  const [analyticsLink, setAnalyticsLink] = useState<LinkItemType | null>(null);

  const committed = useRef<LinkItemType[]>([]);
  const latest = useRef<LinkItemType[]>([]);
  latest.current = links;
  const lastDeleted = useRef<LinkItemType | null>(null);

  const publicUrl =
    typeof window !== "undefined" && profile ? `${window.location.origin}/@${profile.slug}` : "";

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace("/auth");

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      if (!p) return router.replace("/auth");

      const prof = p as Profile;
      const [{ data: l }, { data: myPlan }, { data: clicks }] = await Promise.all([
        supabase.from("links").select("*").eq("profile_id", prof.id).order("position", { ascending: true }),
        supabase.rpc("my_plan"),
        supabase.from("link_clicks").select("referrer, country").eq("profile_id", prof.id),
      ]);

      setProfile(prof);
      setLinks((l ?? []) as LinkItemType[]);
      committed.current = (l ?? []) as LinkItemType[];
      setPlan(["free", "pro", "business"].includes(myPlan) ? myPlan : "free");

      const referrers = (clicks ?? []).map((c: any) => c.referrer).filter(Boolean);
      const sourceMap = new Map<string, number>();
      referrers.forEach((r: string) => {
        const s = extractSource(r);
        sourceMap.set(s, (sourceMap.get(s) ?? 0) + 1);
      });
      const total = referrers.length || 1;
      setTrafficSources(
        Array.from(sourceMap.entries())
          .map(([name, count]) => ({ name, count, percentage: (count / total) * 100 }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      );

      const countryMap = new Map<string, number>();
      (clicks ?? []).forEach((c: any) => {
        if (c.country) countryMap.set(c.country.toUpperCase(), (countryMap.get(c.country.toUpperCase()) ?? 0) + 1);
      });
      setMarkers(
        Array.from(countryMap.entries())
          .filter(([code]) => COUNTRY_COORDS[code])
          .map(([code, count]) => ({
            lat: COUNTRY_COORDS[code][0],
            lon: COUNTRY_COORDS[code][1],
            plan: "free",
            count,
            country: code,
          }))
      );

      setLoading(false);
    })();
  }, [router]);

  /* Raccourcis clavier : Ctrl/Cmd+K = nouveau bloc, Ctrl/Cmd+S = info auto-save */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setModal(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        toast("Enregistrement automatique : chaque modification est appliquée aussitôt.");
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [toast]);

  const rollback = useCallback(
    (msg: string) => {
      setLinks(committed.current);
      toast(msg, false);
    },
    [toast]
  );

  const addLink = async (title: string, url: string, icon?: string) => {
    if (!profile) return false;
    const { data, error } = await supabase
      .from("links")
      .insert({ profile_id: profile.id, title, url: normalizeUrl(url), icon: icon || "link", position: latest.current.length })
      .select()
      .single();
    if (error) {
      if (error.message.includes("link_limit_reached")) {
        toast("Limite de 5 liens actifs atteinte (plan Gratuit) — passe au Pro pour plus", false);
      } else {
        toast("Impossible d'ajouter le bloc", false);
      }
      return false;
    }
    const next = [...latest.current, data as LinkItemType];
    setLinks(next);
    committed.current = next;
    toast("Bloc ajouté");
    return true;
  };

  const updateLink = async (id: string, updates: Partial<LinkItemType>) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    try {
      const { error } = await supabase.from("links").update(updates).eq("id", id);
      if (error) throw new Error();
      committed.current = committed.current.map((l) => (l.id === id ? { ...l, ...updates } : l));
      toast("Enregistré");
    } catch {
      rollback("Modification échouée");
    }
  };

  const restoreLink = async () => {
    const victim = lastDeleted.current;
    if (!victim) return;
    const { error } = await supabase.from("links").insert(victim);
    if (error) return toast("Restauration échouée", false);
    setLinks((prev) => [...prev, victim].sort((a, b) => a.position - b.position));
    committed.current = [...committed.current, victim].sort((a, b) => a.position - b.position);
    lastDeleted.current = null;
    toast("Bloc restauré");
  };

  const deleteLink = async (id: string) => {
    const victim = latest.current.find((l) => l.id === id) ?? null;
    setLinks((prev) => prev.filter((l) => l.id !== id));
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (error) return rollback("Suppression échouée");
    committed.current = committed.current.filter((l) => l.id !== id);
    lastDeleted.current = victim;
    toast("Bloc supprimé", true, { label: "Annuler", onClick: restoreLink });
  };

  const persistOrder = async () => {
    if (!profile) return;
    const ids = latest.current.map((l) => l.id);
    if (ids.join() === committed.current.map((l) => l.id).join()) return;
    try {
      const { error } = await supabase.rpc("update_links_order", { p_profile: profile.id, p_ids: ids });
      if (error) throw new Error(error.message);
      committed.current = [...latest.current];
    } catch (e: any) {
      rollback(`Réorganisation échouée : ${e?.message ?? "erreur inconnue"}`);
    }
  };

  const saveProfile = async (patch: Partial<Profile>) => {
    if (!profile) return;
    if (patch.slug && patch.slug !== profile.slug && isReserved(patch.slug)) {
      toast("Ce nom d'utilisateur est réservé", false);
      return;
    }
    const prev = profile;
    setProfile({ ...profile, ...patch });
    const { error } = await supabase.from("profiles").update(patch).eq("id", profile.id);
    if (error) {
      setProfile(prev);
      if (error.code === "23505") toast("Ce pseudo est déjà pris", false);
      else if (error.message.includes("slug_reserved")) toast("Ce pseudo est réservé", false);
      else toast(`Profil non enregistré : ${error.message}`, false);
    } else toast("Profil enregistré");
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast("Lien copié");
    } catch {
      toast("Copie impossible", false);
    }
  };

  const shareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: profile?.display_name, url: publicUrl });
      } catch {}
    } else copyUrl();
  };

  const exportCsv = async () => {
    if (!profile) return;
    const since = new Date(Date.now() - 90 * 86400000).toISOString();
    const [{ data: clicks }, { data: lnks }] = await Promise.all([
      supabase
        .from("link_clicks")
        .select("created_at, referrer, country, link_id")
        .eq("profile_id", profile.id)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(5000),
      supabase.from("links").select("id, title").eq("profile_id", profile.id),
    ]);
    const titles = new Map<string, string>((lnks ?? []).map((l: any) => [l.id, l.title]));
    const header = ["date", "lien", "source", "pays"];
    const rows = (clicks ?? []).map((c: any) => [
      new Date(c.created_at).toLocaleString("fr-FR"),
      titles.get(c.link_id) ?? "(lien supprimé)",
      extractSource(c.referrer ?? ""),
      c.country ?? "",
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ndeletik-clics-90j-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Export CSV : ${rows.length} clic(s) sur 90 jours`);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/auth");
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-bg p-6 animate-pulse">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="h-8 w-40 rounded bg-line/70" />
          <div className="h-36 rounded-2xl bg-line/70" />
          <div className="h-64 rounded-2xl bg-line/70" />
        </div>
      </div>
    );
  }

  const totalClicks = links.reduce((s, l) => s + l.clicks, 0);
  const maxClicks = Math.max(1, ...links.map((l) => l.clicks));
  const activeLinks = links.filter((l) => l.enabled).length;

  return (
    <div className="min-h-screen bg-bg text-ink">
      <OfflineBanner />
      <div className="max-w-6xl mx-auto sm:p-6">
        <div className="bg-surface sm:rounded-3xl border border-line shadow-soft overflow-hidden pb-6">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-line">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-display font-extrabold"
            >
              Mon lien bio
            </motion.h1>
            <div className="flex items-center gap-2">
              <a
                href={`/@${profile.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-line text-sm text-muted hover:border-fractal-ocre hover:text-fractal-terra transition-colors"
              >
                <Eye size={14} /> Voir ma page
              </a>
              <a
                href="/dashboard/themes"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-line text-sm text-muted hover:border-fractal-ocre hover:text-fractal-terra transition-colors"
              >
                <SwatchBook size={14} /> Thèmes
              </a>
              <a
                href="/dashboard/sections"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-line text-sm text-muted hover:border-fractal-ocre hover:text-fractal-terra transition-colors"
              >
                <LayoutList size={14} /> Sections
              </a>
              <button
                onClick={() => setTab("appearance")}
                aria-label="Éditer mon profil"
                title="Éditer mon profil"
                className="p-2 rounded-lg text-muted hover:bg-soft hover:text-fractal-ocre transition-colors"
              >
                <User size={18} />
              </button>
              <button
                onClick={logout}
                aria-label="Déconnexion"
                className="p-2 rounded-lg text-muted hover:bg-soft hover:text-fractal-terra transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          <Banner url={profile.cover_url} className="h-32 sm:h-40" />

          <ProfileCard profile={profile} publicUrl={publicUrl} onCopy={copyUrl} onShare={shareUrl} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-3 px-4 sm:px-6 mt-6"
          >
            <div className="bg-soft rounded-xl p-4 border border-line">
              <div className="text-xs text-muted mb-1 flex items-center gap-1"><Link2 size={12} /> Liens actifs</div>
              <div className="text-2xl font-display font-bold text-fractal-ocre">{activeLinks}</div>
            </div>
            <div className="bg-soft rounded-xl p-4 border border-line">
              <div className="text-xs text-muted mb-1 flex items-center gap-1"><TrendingUp size={12} /> Clics totaux</div>
              <div className="text-2xl font-display font-bold text-fractal-terra">{totalClicks}</div>
            </div>
            <div className="bg-soft rounded-xl p-4 border border-line">
              <div className="text-xs text-muted mb-1 flex items-center gap-1"><Eye size={12} /> Vues de page</div>
              <div className="text-2xl font-display font-bold text-fractal-or">{profile.views ?? 0}</div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_360px] gap-6 px-4 sm:px-6 mt-6">
            <section className="min-w-0">
              <div role="tablist" className="flex gap-5 border-b border-line mb-5">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={tab === t.id}
                    onClick={() => setTab(t.id)}
                    className={`pb-2.5 text-sm -mb-px border-b-2 transition-colors flex items-center gap-1.5 ${
                      tab === t.id
                        ? "border-fractal-ocre text-fractal-terra font-semibold"
                        : "border-transparent text-muted hover:text-ink"
                    }`}
                  >
                    <t.icon size={14} />
                    {t.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {tab === "lynk" && (
                  <motion.div
                    key="lynk"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <LinkTemplates onAdd={addLink} />

                    <p className="text-sm font-semibold mb-3">Liste des blocs ({links.length})</p>
                    <button
                      onClick={() => setModal(true)}
                      className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm border border-fractal-terra/20 mb-2 ${btnPrimary}`}
                    >
                      <Plus size={18} /> Ajouter un nouveau lien
                    </button>
                    <p className="mb-4 text-center text-[11px] text-muted">
                      Astuce : <kbd className="rounded border border-line bg-soft px-1">Ctrl</kbd> +{" "}
                      <kbd className="rounded border border-line bg-soft px-1">K</kbd> pour ajouter un bloc.
                    </p>

                    {links.length === 0 ? (
                      <div className="text-center py-14 rounded-2xl border-2 border-dashed border-line">
                        <Link2 size={48} className="mx-auto text-line mb-3" />
                        <p className="text-sm font-semibold mb-1">Aucun lien pour le moment</p>
                        <p className="text-xs text-muted">Utilise les modèles ci-dessus ou le bouton orange.</p>
                      </div>
                    ) : (
                      <Reorder.Group axis="y" values={links} onReorder={setLinks} className="space-y-2.5 p-0">
                        {links.map((l) => (
                          <LinkItem
                            key={l.id}
                            link={l}
                            onUpdate={updateLink}
                            onDelete={deleteLink}
                            onDragEnd={persistOrder}
                            onShowAnalytics={setAnalyticsLink}
                          />
                        ))}
                      </Reorder.Group>
                    )}

                    <div className="mt-6">
                      <ShortLinkManager userId={profile.user_id} plan={plan} />
                    </div>
                  </motion.div>
                )}

                {tab === "appearance" && (
                  <motion.div
                    key="appearance"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <AppearanceForm profile={profile} onSave={saveProfile} />
                  </motion.div>
                )}

                {tab === "statistic" && (
                  <motion.div
                    key="statistic"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Analyse des 90 derniers jours</p>
                      <button
                        onClick={exportCsv}
                        className="inline-flex items-center gap-1.5 rounded-full bg-fractal-ocre hover:bg-fractal-terra px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                      >
                        <Download size={12} /> Export CSV
                      </button>
                    </div>

                    <AnalyticsChart profile={profile} />

                    {trafficSources.length > 0 && (
                      <div className="bg-soft rounded-2xl p-5 border border-line">
                        <div className="flex items-center gap-2 mb-4">
                          <Globe size={16} className="text-fractal-ocre" />
                          <h3 className="text-sm font-semibold">Sources de trafic</h3>
                        </div>
                        <ul className="space-y-3">
                          {trafficSources.map((s) => (
                            <li key={s.name}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium">{s.name}</span>
                                <span className="text-muted">
                                  {s.count} ({s.percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="h-2 rounded-full bg-line/50">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${s.percentage}%` }}
                                  transition={{ duration: 0.5, ease: "easeOut" }}
                                  className="h-2 rounded-full bg-gradient-to-r from-fractal-ocre to-fractal-terra"
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {markers.length > 0 && (
                      <div className="bg-soft rounded-2xl p-5 border border-line">
                        <div className="flex items-center gap-2 mb-4">
                          <Globe size={16} className="text-fractal-ocre" />
                          <h3 className="text-sm font-semibold">Pays de tes visiteurs</h3>
                        </div>
                        <WorldMap markers={markers} />
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-semibold mb-3">Détails par lien</p>
                      <ul className="space-y-3">
                        {[...links]
                          .sort((a, b) => b.clicks - a.clicks)
                          .map((l) => (
                            <li key={l.id}>
                              <button
                                onClick={() => setAnalyticsLink(l)}
                                className="w-full text-left group"
                                title="Voir le détail du lien"
                              >
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="truncate pr-3 font-medium group-hover:text-fractal-terra transition-colors">
                                    {l.title}
                                  </span>
                                  <span className="text-muted">{l.clicks} clics</span>
                                </div>
                                <div className="h-2 rounded-full bg-line/50">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(l.clicks / maxClicks) * 100}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className="h-2 rounded-full bg-fractal-ocre"
                                  />
                                </div>
                              </button>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <aside>
              <div className="rounded-3xl border border-line bg-surface shadow-soft lg:sticky lg:top-6 p-5 text-center space-y-3">
                <p className="text-sm font-semibold">Ta page, tout compris</p>
                <a
                  href="/dashboard/themes"
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm ${btnPrimary}`}
                >
                  <SwatchBook size={16} /> Éditeur de thèmes
                </a>
                <a
                  href="/dashboard/sections"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line px-5 py-3 text-sm text-muted hover:border-fractal-ocre hover:text-fractal-terra transition-colors"
                >
                  <LayoutList size={16} /> Sections & réseaux
                </a>
                <a
                  href={`/@${profile.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line px-5 py-3 text-sm text-muted hover:border-fractal-ocre hover:text-fractal-terra transition-colors"
                >
                  <Eye size={16} /> Voir ma page publique
                </a>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <AddBlockModal open={modal} onClose={() => setModal(false)} onAdd={addLink} />
      <LinkAnalyticsModal
        open={!!analyticsLink}
        onClose={() => setAnalyticsLink(null)}
        link={analyticsLink}
        profile={profile}
      />
      {toastNode}
    </div>
  );
}

function extractSource(url: string): string {
  if (!url) return "Direct";
  try {
    const domain = new URL(url).hostname.replace(/^www\./, "");
    if (domain.includes("instagram")) return "Instagram";
    if (domain.includes("tiktok")) return "TikTok";
    if (domain.includes("facebook") || domain.includes("fb.")) return "Facebook";
    if (domain.includes("twitter") || domain.includes("x.com")) return "X (Twitter)";
    if (domain.includes("youtube")) return "YouTube";
    if (domain.includes("linkedin")) return "LinkedIn";
    if (domain.includes("google")) return "Google";
    return domain;
  } catch {
    return "Direct";
  }
}

function AppearanceForm({
  profile,
  onSave,
}: {
  profile: Profile;
  onSave: (p: Partial<Profile>) => void;
}) {
  const [f, setF] = useState({
    slug: profile.slug,
    display_name: profile.display_name,
    headline: profile.headline ?? "",
    bio: profile.bio ?? "",
    avatar_url: profile.avatar_url ?? "",
    cover_url: profile.cover_url ?? "",
    country: profile.country ?? "",
  });

  const set =
    (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setF((p) => ({ ...p, [k]: e.target.value }));

  const cls =
    "w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink focus:outline-none focus:border-fractal-ocre transition-colors";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          slug: f.slug.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "") || profile.slug,
          display_name: f.display_name.trim() || profile.display_name,
          headline: f.headline.trim() || null,
          bio: f.bio.trim() || null,
          avatar_url: f.avatar_url.trim() || null,
          cover_url: f.cover_url.trim() || null,
          country: f.country || null,
        });
      }}
      className="space-y-6 max-w-xl"
    >
      <div className="bg-soft rounded-2xl p-5 border border-line">
        <h3 className="text-sm font-semibold mb-3">Photo de profil</h3>
        <div className="flex items-center gap-4">
          {f.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={f.avatar_url}
              alt="Aperçu avatar"
              className="h-20 w-20 rounded-full object-cover ring-4 ring-surface shadow-soft"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-fractal-ocre text-white flex items-center justify-center font-bold text-xl">
              {f.display_name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <p className="text-xs text-muted mb-2">Format carré, 3 Mo maximum</p>
            <UploadButton
              kind="avatar"
              onDone={(url) => {
                setF((p) => ({ ...p, avatar_url: url }));
                onSave({ avatar_url: url });
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-soft rounded-2xl p-5 border border-line">
        <h3 className="text-sm font-semibold mb-3">Bannière (couverture)</h3>
        <div className="h-24 rounded-xl overflow-hidden border border-line mb-3">
          {f.cover_url ? (
            <div className="h-full bg-cover bg-center" style={{ backgroundImage: `url(${f.cover_url})` }} />
          ) : (
            <div className="h-full bg-fractal-ocre/30" />
          )}
        </div>
        <p className="text-xs text-muted mb-2">Format rectangulaire, 3 Mo maximum</p>
        <UploadButton
          kind="banner"
          onDone={(url) => {
            setF((p) => ({ ...p, cover_url: url }));
            onSave({ cover_url: url });
          }}
        />
      </div>

      <div className="bg-soft rounded-2xl p-5 border border-line space-y-4">
        <h3 className="text-sm font-semibold">Informations</h3>
        <label className="block">
          <span className="text-xs text-muted mb-1.5 block">Pseudo (URL publique /@pseudo)</span>
          <input value={f.slug} onChange={set("slug")} className={cls} />
        </label>
        <label className="block">
          <span className="text-xs text-muted mb-1.5 block">Nom affiché</span>
          <input value={f.display_name} onChange={set("display_name")} className={cls} />
        </label>
        <label className="block">
          <span className="text-xs text-muted mb-1.5 block">Titre (sous le nom)</span>
          <input
            value={f.headline}
            onChange={set("headline")}
            className={cls}
            placeholder="Ex : Coach business · Pointe-Noire"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted mb-1.5 block">Bio</span>
          <textarea rows={3} value={f.bio} onChange={set("bio")} className={cls} />
        </label>
        <label className="block">
          <span className="text-xs text-muted mb-1.5 block">Pays</span>
          <select
            value={f.country}
            onChange={(e) => setF((p) => ({ ...p, country: e.target.value }))}
            className={cls}
          >
            <option value="">— Choisir mon pays —</option>
            {COUNTRY_GROUPS.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.countries.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value="Autre">Autre (non listé)</option>
          </select>
        </label>
      </div>

      <button
        type="submit"
        className={`w-full rounded-xl px-6 py-3.5 text-sm border border-fractal-terra/20 ${btnPrimary}`}
      >
        Enregistrer les modifications
      </button>
    </form>
  );
}