"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Reorder } from "framer-motion";
import { LogOut, Plus, MoreHorizontal, Link2, Eye, Sparkles, ArrowLeft, Shield } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { LinkItem as LinkItemType } from "@/lib/types";
import { LinkItem } from "@/components/dashboard/LinkItem";
import { ProfileCard, Banner, type Profile } from "@/components/dashboard/ProfileCard";
import { PhonePreview } from "@/components/dashboard/PhonePreview";
import { AddBlockModal } from "@/components/dashboard/AddBlockModal";
import { useToast } from "@/components/dashboard/Toast";
import { normalizeUrl } from "@/components/dashboard/blockMeta";
import { UploadButton } from "@/components/dashboard/UploadButton";

type Tab = "lynk" | "appearance" | "statistic";
const TABS: { id: Tab; label: string }[] = [
  { id: "lynk", label: "Liens" },
  { id: "appearance", label: "Apparence" },
  { id: "statistic", label: "Statistiques" },
];

export default function Dashboard() {
  const router = useRouter();
  const { toast, node: toastNode } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<LinkItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("lynk");
  const [modal, setModal] = useState(false);

  const committed = useRef<LinkItemType[]>([]);
  const latest = useRef<LinkItemType[]>([]);
  latest.current = links;

  const publicUrl =
    typeof window !== "undefined" && profile
      ? `${window.location.origin}/${profile.username}`
      : "";

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace("/auth");
      const uid = session.user.id;
      const [{ data: p }, { data: l }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", uid).single(),
        supabase.from("links").select("*").eq("user_id", uid).order("display_order", { ascending: true }),
      ]);
      if (p) setProfile(p as Profile);
      setLinks((l ?? []) as LinkItemType[]);
      committed.current = (l ?? []) as LinkItemType[];
      setLoading(false);
    })();
  }, [router]);

  const rollback = useCallback(
    (msg: string) => {
      setLinks(committed.current);
      toast(msg, false);
    },
    [toast]
  );

  const addLink = async (title: string, url: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    const { data, error } = await supabase
      .from("links")
      .insert({
        user_id: session.user.id,
        title,
        url: normalizeUrl(url),
        display_order: latest.current.length,
      })
      .select()
      .single();
    if (error || !data) {
      toast("Impossible d'ajouter le bloc", false);
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
      committed.current = committed.current.map((l) =>
        l.id === id ? { ...l, ...updates } : l
      );
      toast("Enregistré");
    } catch {
      rollback("Modification échouée");
    }
  };

  const deleteLink = async (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (error) return rollback("Suppression échouée");
    committed.current = committed.current.filter((l) => l.id !== id);
    toast("Bloc supprimé");
  };

  const persistOrder = async () => {
    const ids = latest.current.map((l) => l.id);
    if (ids.join() === committed.current.map((l) => l.id).join()) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error();
      const { error } = await supabase.rpc("update_links_order", {
        p_user_id: session.user.id,
        p_link_ids: ids,
      });
      if (error) throw new Error(error.message);
      committed.current = [...latest.current];
    } catch (e: any) {
      rollback(`Réorganisation échouée : ${e?.message ?? "erreur inconnue"}`);
    }
  };

  const saveProfile = async (patch: Partial<Profile>) => {
    if (!profile) return;
    const prev = profile;
    setProfile({ ...profile, ...patch });
    const { error } = await supabase.from("profiles").update(patch).eq("id", profile.id);
    if (error) {
      setProfile(prev);
      toast("Profil non enregistré", false);
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
        await navigator.share({ title: profile?.display_name || profile?.username, url: publicUrl });
      } catch {}
    } else copyUrl();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/auth");
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-bg p-6">
        <div className="max-w-6xl mx-auto space-y-4 animate-pulse">
          <div className="h-8 w-40 rounded bg-soft" />
          <div className="h-36 rounded-2xl bg-soft" />
          <div className="h-24 rounded-2xl bg-soft" />
          <div className="h-64 rounded-2xl bg-soft" />
        </div>
      </div>
    );
  }

  const totalClicks = links.reduce((s, l) => s + l.clicks, 0);
  const maxClicks = Math.max(1, ...links.map((l) => l.clicks));

  return (
    <div className="min-h-screen bg-bg text-ink">
      <div className="max-w-6xl mx-auto sm:p-6">
        <div className="bg-surface sm:rounded-2xl shadow-soft overflow-hidden pb-6 border border-line">
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-line">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-1 text-sm text-muted hover:text-fractal-ocre transition-colors">
                <ArrowLeft size={14} /> Accueil
              </Link>
              <h1 className="text-xl font-display font-bold">Mon lien bio</h1>
            </div>
            <button
              onClick={logout}
              aria-label="Déconnexion"
              className="p-2 rounded-lg text-muted hover:text-ink hover:bg-soft transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>

          <Banner url={profile.banner_url} className="h-32 sm:h-40" />

          <ProfileCard
            profile={profile}
            publicUrl={publicUrl}
            onCopy={copyUrl}
            onShare={shareUrl}
            onCustomize={() => setTab("appearance")}
          />

          <div className="grid lg:grid-cols-[1fr_360px] gap-6 px-4 sm:px-6 mt-6">
            <section className="min-w-0">
              {/* Onglets */}
              <div role="tablist" className="flex gap-5 border-b border-line mb-5">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={tab === t.id}
                    onClick={() => setTab(t.id)}
                    className={`pb-2.5 text-sm -mb-px border-b-2 transition-colors font-medium ${
                      tab === t.id
                        ? "border-fractal-ocre text-fractal-terra"
                        : "border-transparent text-muted hover:text-ink"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {tab === "lynk" && (
                <>
                  <p className="text-sm font-semibold mb-3">
                    Liste des blocs ({links.length})
                  </p>
                  <button
                    onClick={() => setModal(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-yekola-gradient hover:opacity-90 text-white text-sm font-semibold py-3.5 transition-all shadow-soft hover:shadow-glow"
                  >
                    <Plus size={16} /> Ajouter un bloc
                  </button>
                  {links.length === 0 ? (
                    <div className="mt-4 text-center py-14 rounded-xl border border-dashed border-line bg-soft/50">
                      <Link2 size={36} className="mx-auto text-muted mb-2" />
                      <p className="text-sm text-muted">Aucun bloc pour le moment.</p>
                      <p className="text-xs text-muted/70 mt-1">Ajoute ton premier lien pour remplir ta page.</p>
                    </div>
                  ) : (
                    <Reorder.Group axis="y" values={links} onReorder={setLinks} className="mt-4 space-y-2.5 p-0">
                      {links.map((l) => (
                        <LinkItem
                          key={l.id}
                          link={l}
                          onUpdate={updateLink}
                          onDelete={deleteLink}
                          onDragEnd={persistOrder}
                        />
                      ))}
                    </Reorder.Group>
                  )}
                </>
              )}

              {tab === "appearance" && (
                <AppearanceForm profile={profile} onSave={saveProfile} />
              )}

              {tab === "statistic" && (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-soft rounded-xl p-4 border border-line">
                      <div className="text-xs text-muted mb-1 flex items-center gap-1">
                        <Eye size={14} className="text-fractal-ocre" /> Vues de page
                      </div>
                      <div className="text-2xl font-display font-bold text-ink">
                        {profile.views ?? 0}
                      </div>
                    </div>
                    <div className="bg-soft rounded-xl p-4 border border-line">
                      <div className="text-xs text-muted mb-1">Clics totaux</div>
                      <div className="text-2xl font-display font-bold text-fractal-terra">{totalClicks}</div>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-ink mb-3">Détails par lien</p>
                  <ul className="space-y-3">
                    {[...links].sort((a, b) => b.clicks - a.clicks).map((l) => (
                      <li key={l.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="truncate pr-3 text-ink">{l.title}</span>
                          <span className="text-muted font-medium">{l.clicks}</span>
                        </div>
                        <div className="h-2 rounded-full bg-soft">
                          <div
                            className="h-2 rounded-full bg-yekola-gradient transition-all duration-500"
                            style={{ width: `${(l.clicks / maxClicks) * 100}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <aside className="hidden lg:block">
              <div className="sticky top-6 rounded-2xl border border-line bg-surface shadow-soft">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
                  <span className="text-sm font-semibold">Aperçu</span>
                  <MoreHorizontal size={16} className="text-muted" />
                </div>
                <div className="py-6 bg-soft/50 rounded-b-2xl">
                  <PhonePreview profile={profile} links={links} />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <AddBlockModal open={modal} onClose={() => setModal(false)} onAdd={addLink} />
      {toastNode}
    </div>
  );
}

function AppearanceForm({
  profile,
  onSave,
}: {
  profile: Profile;
  onSave: (p: Partial<Profile>) => void;
}) {
  const [f, setF] = useState({
    username: profile.username,
    display_name: profile.display_name ?? "",
    bio: profile.bio ?? "",
    avatar_url: profile.avatar_url ?? "",
    banner_url: profile.banner_url ?? "",
    country: profile.country ?? "",
  });

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const cls =
    "rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-fractal-ocre/40";

  const applyAvatar = (url: string) => {
    setF((p) => ({ ...p, avatar_url: url }));
    onSave({ avatar_url: url });
  };

  const applyBanner = (url: string) => {
    setF((p) => ({ ...p, banner_url: url }));
    onSave({ banner_url: url });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          username: f.username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, ""),
          display_name: f.display_name.trim() || null,
          bio: f.bio.trim() || null,
          avatar_url: f.avatar_url.trim() || null,
          banner_url: f.banner_url.trim() || null,
          country: f.country.trim() || null,
        });
      }}
      className="grid gap-5 max-w-xl"
    >
      <div className="flex items-center gap-4">
        {f.avatar_url ? (
          <img src={f.avatar_url} alt="Aperçu avatar" className="h-16 w-16 rounded-full object-cover ring-2 ring-surface shadow-soft" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-yekola-gradient text-white flex items-center justify-center font-bold">
            {(f.display_name || f.username).slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="grid gap-1">
          <span className="text-xs text-muted">Photo de profil (3 Mo max)</span>
          <UploadButton kind="avatar" onDone={applyAvatar} />
        </div>
      </div>

      <div className="grid gap-2">
        <div className="h-20 rounded-xl overflow-hidden border border-line">
          {f.banner_url ? (
            <div className="h-full bg-cover bg-center" style={{ backgroundImage: `url(${f.banner_url})` }} />
          ) : (
            <div className="h-full bg-yekola-gradient" />
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">Bannière (3 Mo max)</span>
          <UploadButton kind="banner" onDone={applyBanner} />
        </div>
      </div>

      <label className="grid gap-1 text-xs text-muted">
        Nom d&apos;utilisateur (URL)
        <input value={f.username} onChange={set("username")} className={cls} />
      </label>
      <label className="grid gap-1 text-xs text-muted">
        Nom affiché
        <input value={f.display_name} onChange={set("display_name")} className={cls} />
      </label>
      <label className="grid gap-1 text-xs text-muted">
        Bio
        <textarea rows={3} value={f.bio} onChange={set("bio")} className={cls} />
      </label>
      <label className="grid gap-1 text-xs text-muted">
        Pays
        <input value={f.country} onChange={set("country")} className={cls} />
      </label>

      <button
        type="submit"
        className="justify-self-start rounded-lg bg-yekola-gradient hover:opacity-90 text-white text-sm font-semibold px-5 py-2.5 shadow-soft transition-all"
      >
        Enregistrer
      </button>
    </form>
  );
}