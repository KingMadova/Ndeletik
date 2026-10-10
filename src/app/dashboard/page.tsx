"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Reorder } from "framer-motion";
import { LogOut, Plus, Link2, Eye, User, Palette, BarChart3, SwatchBook } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { LinkItem as LinkItemType, Profile } from "@/lib/types";
import { LinkItem } from "@/components/dashboard/LinkItem";
import { ProfileCard, Banner } from "@/components/dashboard/ProfileCard";
import { AddBlockModal } from "@/components/dashboard/AddBlockModal";
import { useToast } from "@/components/dashboard/Toast";
import { normalizeUrl } from "@/components/dashboard/blockMeta";
import { UploadButton } from "@/components/dashboard/UploadButton";
import { ShortLinkManager } from "@/components/dashboard/ShortLinkManager";
import { OfflineBanner } from "@/components/dashboard/OfflineBanner";
import { COUNTRY_GROUPS } from "@/lib/countries";
import { isReserved } from "@/lib/reserved";

const btnPrimary =
  "bg-fractal-ocre hover:bg-fractal-terra text-white font-semibold transition-colors shadow-soft";

type Tab = "lynk" | "appearance" | "statistic";
const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "lynk", label: "Liens", icon: Link2 },
  { id: "appearance", label: "Apparence", icon: Palette },
  { id: "statistic", label: "Statistiques", icon: BarChart3 },
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
      const { data: l } = await supabase
        .from("links")
        .select("*")
        .eq("profile_id", prof.id)
        .order("position", { ascending: true });
      setProfile(prof);
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
    if (!profile) return false;
    const { data, error } = await supabase
      .from("links")
      .insert({
        profile_id: profile.id,
        title,
        url: normalizeUrl(url),
        position: latest.current.length,
      })
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

  const deleteLink = async (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (error) return rollback("Suppression échouée");
    committed.current = committed.current.filter((l) => l.id !== id);
    toast("Bloc supprimé");
  };

  const persistOrder = async () => {
    if (!profile) return;
    const ids = latest.current.map((l) => l.id);
    if (ids.join() === committed.current.map((l) => l.id).join()) return;
    try {
      const { error } = await supabase.rpc("update_links_order", {
        p_profile: profile.id,
        p_ids: ids,
      });
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
            <h1 className="text-xl font-display font-extrabold">Mon lien bio</h1>
            <div className="flex items-center gap-2">
              <a
                href={`/@@${profile.slug}`.replace("@@", "@")}
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

          <div className="grid grid-cols-3 gap-3 px-4 sm:px-6 mt-6">
            <div className="bg-soft rounded-xl p-4 border border-line">
              <div className="text-xs text-muted mb-1">Liens actifs</div>
              <div className="text-2xl font-display font-bold text-fractal-ocre">{activeLinks}</div>
            </div>
            <div className="bg-soft rounded-xl p-4 border border-line">
              <div className="text-xs text-muted mb-1">Clics totaux</div>
              <div className="text-2xl font-display font-bold text-fractal-terra">{totalClicks}</div>
            </div>
            <div className="bg-soft rounded-xl p-4 border border-line">
              <div className="text-xs text-muted mb-1">Vues de page</div>
              <div className="text-2xl font-display font-bold text-fractal-or">{profile.views ?? 0}</div>
            </div>
          </div>

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

              {tab === "lynk" && (
                <>
                  <p className="text-sm font-semibold mb-3">Liste des blocs ({links.length})</p>

                  <button
                    onClick={() => setModal(true)}
                    className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm border border-fractal-terra/20 mb-4 ${btnPrimary}`}
                  >
                    <Plus size={18} /> Ajouter un nouveau lien
                  </button>

                  {links.length === 0 ? (
                    <div className="text-center py-14 rounded-2xl border-2 border-dashed border-line">
                      <Link2 size={48} className="mx-auto text-line mb-3" />
                      <p className="text-sm font-semibold mb-1">Aucun lien pour le moment</p>
                      <p className="text-xs text-muted">Clique sur le bouton orange ci-dessus.</p>
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
                        />
                      ))}
                    </Reorder.Group>
                  )}

                  <div className="mt-6">
                    <ShortLinkManager userId={profile.user_id} plan="free" />
                  </div>
                </>
              )}

              {tab === "appearance" && <AppearanceForm profile={profile} onSave={saveProfile} />}

              {tab === "statistic" && (
                <div>
                  <div className="bg-soft rounded-2xl p-5 border border-line mb-4">
                    <div className="text-xs text-muted mb-1">Clics totaux</div>
                    <div className="text-3xl font-display font-bold">{totalClicks}</div>
                  </div>
                  <p className="text-sm font-semibold mb-3">Détails par lien</p>
                  <ul className="space-y-3">
                    {[...links]
                      .sort((a, b) => b.clicks - a.clicks)
                      .map((l) => (
                        <li key={l.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="truncate pr-3 font-medium">{l.title}</span>
                            <span className="text-muted">{l.clicks} clics</span>
                          </div>
                          <div className="h-2 rounded-full bg-line/50">
                            <div
                              className="h-2 rounded-full bg-fractal-ocre transition-all duration-500"
                              style={{ width: `${(l.clicks / maxClicks) * 100}%` }}
                            />
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </section>

            <aside>
              <div className="rounded-3xl border border-line bg-surface shadow-soft lg:sticky lg:top-6 p-5 text-center">
                <p className="text-sm font-semibold mb-2">Aperçu & thèmes</p>
                <p className="text-xs text-muted mb-4">
                  Visualise ta page publique et choisis parmi 18 thèmes (4 gratuits, 7 Pro, 7 Business).
                </p>
                <a
                  href="/dashboard/themes"
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm ${btnPrimary}`}
                >
                  <SwatchBook size={16} /> Ouvrir l&apos;éditeur de thèmes
                </a>
                <a
                  href={`/@@${profile.slug}`.replace("@@", "@")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line px-5 py-3 text-sm text-muted hover:border-fractal-ocre hover:text-fractal-terra transition-colors"
                >
                  <Eye size={16} /> Voir ma page publique
                </a>
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
          <input value={f.headline} onChange={set("headline")} className={cls} placeholder="Ex : Coach business · Pointe-Noire" />
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