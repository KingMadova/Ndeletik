"use client";

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toProfile } from "@/lib/profile-mapper";
import { isReserved } from "@/lib/reserved";
import { ENTITLEMENTS } from "@/lib/entitlements";
import { canCreateProfile, profileLimitMessage, PROFILE_LIMITS } from "@/lib/multi-profiles";
import { PROFILE_COOKIE, type DbLink, type DbProfile } from "@/lib/dashboard-types";
import type { Plan } from "@/lib/plans";
import type { Profile as PublicProfile } from "@/lib/themes/types";
import { normalizeUrl } from "./blockMeta";
import { ToastProvider, useToast } from "./Toast";

/** Champs modifiables du profil (clés camelCase côté interface, converties en colonnes SQL à l'enregistrement). */
export type ProfilePatch = Partial<{
  slug: string;
  displayName: string;
  headline: string | undefined;
  bio: string | undefined;
  avatarUrl: string | undefined;
  coverUrl: string | undefined;
  country: string | undefined;
  heroUrl: string | undefined;
}>;

const COLUMNS: Record<keyof ProfilePatch, string> = {
  slug: "slug",
  displayName: "display_name",
  headline: "headline",
  bio: "bio",
  avatarUrl: "avatar_url",
  coverUrl: "cover_url",
  country: "country",
  heroUrl: "hero_url",
};

type Ctx = {
  ready: boolean;
  userId: string | null;
  plan: Plan;
  profiles: DbProfile[];
  profileId: string | null;
  row: DbProfile | null;
  /** Profil au format du rendu public, recalculé à chaque modification des liens (aperçu réellement « en direct »). */
  profile: PublicProfile | null;
  links: DbLink[];
  setLinks: (links: DbLink[]) => void;
  publicUrl: string;
  activeLinks: number;
  maxLinks: number | null;
  profileLimit: number;
  canCreateProfile: boolean;
  selectProfile: (id: string) => void;
  createNewProfile: () => Promise<void>;
  addLink: (title: string, url: string, icon?: string) => Promise<boolean>;
  updateLink: (id: string, updates: Partial<DbLink>) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  persistOrder: () => Promise<void>;
  saveProfile: (patch: ProfilePatch) => Promise<boolean>;
  copyUrl: () => Promise<void>;
  shareUrl: () => Promise<void>;
  logout: () => Promise<void>;
};

const DashboardCtx = createContext<Ctx | null>(null);

export function useDashboard(): Ctx {
  const ctx = useContext(DashboardCtx);
  if (!ctx) throw new Error("useDashboard doit être utilisé dans <DashboardProvider>");
  return ctx;
}

const byCreated = (a: DbProfile, b: DbProfile) => (a.created_at ?? "").localeCompare(b.created_at ?? "");

function readCookie(): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${PROFILE_COOKIE}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <Inner>{children}</Inner>
    </ToastProvider>
  );
}

function Inner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan>("free");
  const [profiles, setProfiles] = useState<DbProfile[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [row, setRow] = useState<DbProfile | null>(null);
  const [links, setLinks] = useState<DbLink[]>([]);
  const [booted, setBooted] = useState(false);

  const committed = useRef<DbLink[]>([]);
  const latest = useRef<DbLink[]>([]);
  latest.current = links;
  const lastDeleted = useRef<DbLink | null>(null);

  /* 1) Session, profils de l'utilisateur et plan */
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace("/auth");
      const [{ data: owned }, { data: myPlan }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", session.user.id),
        supabase.rpc("my_plan"),
      ]);
      const list = ((owned ?? []) as DbProfile[]).slice().sort(byCreated);
      if (list.length === 0) return router.replace("/onboarding");
      const remembered = readCookie();
      setUserId(session.user.id);
      setPlan(["free", "pro", "business"].includes(myPlan) ? (myPlan as Plan) : "free");
      setProfiles(list);
      setProfileId(list.find((p) => p.id === remembered)?.id ?? list[0].id);
      setBooted(true);
    })();
  }, [router]);

  /* 2) Données du profil sélectionné */
  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;
    (async () => {
      const [{ data: p }, { data: l }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", profileId).single(),
        supabase.from("links").select("*").eq("profile_id", profileId).order("position", { ascending: true }),
      ]);
      if (cancelled || !p) return;
      const rows = (l ?? []) as DbLink[];
      setRow(p as DbProfile);
      setLinks(rows);
      committed.current = rows;
    })();
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  const profile = useMemo(
    () => (row ? toProfile({ profile: row, plan, links }).profile : null),
    [row, plan, links]
  );

  const ready = booted && !!row && row.id === profileId;

  const publicUrl = useMemo(
    () => (typeof window !== "undefined" && row ? `${window.location.origin}/@${row.slug}` : ""),
    [row]
  );

  const selectProfile = useCallback((id: string) => {
    document.cookie = `${PROFILE_COOKIE}=${encodeURIComponent(id)}; path=/; max-age=31536000; samesite=lax`;
    setProfileId(id);
  }, []);

  const createNewProfile = async () => {
    if (!canCreateProfile(plan, profiles.length)) return toast(profileLimitMessage(plan), false);
    if (!userId) return;
    const n = profiles.length + 1;
    const slug = `profil-${n}`;
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        user_id: userId,
        slug,
        display_name: `Profil ${n}`,
        bio: "Nouveau profil",
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${slug}`,
      })
      .select("*")
      .single();
    if (error || !data) {
      if (error?.code === "23505") toast("Ce pseudo est déjà pris", false);
      else toast(`Erreur : ${error?.message ?? "création impossible"}`, false);
      return;
    }
    setProfiles((prev) => [...prev, data as DbProfile]);
    selectProfile((data as DbProfile).id);
    toast("Nouveau profil créé");
  };

  /* ---------- Liens ---------- */
  const rollback = useCallback(
    (msg: string) => {
      setLinks(committed.current);
      toast(msg, false);
    },
    [toast]
  );

  const addLink = async (title: string, url: string, icon?: string) => {
    if (!profileId) return false;
    const { data, error } = await supabase
      .from("links")
      .insert({ profile_id: profileId, title, url: normalizeUrl(url), icon: icon || "link", position: latest.current.length })
      .select()
      .single();
    if (error || !data) {
      if (error?.message.includes("link_limit_reached")) {
        toast(`Limite de ${ENTITLEMENTS.free.maxLinks} liens actifs atteinte (plan Gratuit). Passe au Pro pour en ajouter plus.`, false);
      } else toast("Impossible d'ajouter le lien", false);
      return false;
    }
    const next = [...latest.current, data as DbLink];
    setLinks(next);
    committed.current = next;
    toast("Lien ajouté");
    return true;
  };

  const updateLink = async (id: string, updates: Partial<DbLink>) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    const { error } = await supabase.from("links").update(updates).eq("id", id);
    if (error) {
      if (error.message.includes("link_limit_reached")) {
        rollback(`Limite de ${ENTITLEMENTS.free.maxLinks} liens actifs atteinte. Passe au Pro pour en publier plus.`);
      } else rollback("Modification échouée");
      return;
    }
    committed.current = committed.current.map((l) => (l.id === id ? { ...l, ...updates } : l));
    toast("Enregistré");
  };

  const restoreLink = async () => {
    const victim = lastDeleted.current;
    if (!victim) return;
    const { error } = await supabase.from("links").insert(victim);
    if (error) return toast("Restauration échouée", false);
    const sort = (a: DbLink, b: DbLink) => a.position - b.position;
    setLinks((prev) => [...prev, victim].sort(sort));
    committed.current = [...committed.current, victim].sort(sort);
    lastDeleted.current = null;
    toast("Lien restauré");
  };

  const deleteLink = async (id: string) => {
    const victim = latest.current.find((l) => l.id === id) ?? null;
    setLinks((prev) => prev.filter((l) => l.id !== id));
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (error) return rollback("Suppression échouée");
    committed.current = committed.current.filter((l) => l.id !== id);
    lastDeleted.current = victim;
    toast("Lien supprimé", true, { label: "Annuler", onClick: restoreLink });
  };

  const persistOrder = async () => {
    if (!profileId) return;
    const ids = latest.current.map((l) => l.id);
    if (ids.join() === committed.current.map((l) => l.id).join()) return;
    const { error } = await supabase.rpc("update_links_order", { p_profile: profileId, p_ids: ids });
    if (error) return rollback(`Réorganisation échouée : ${error.message}`);
    committed.current = [...latest.current];
  };

  /* ---------- Profil ---------- */
  const saveProfile = async (patch: ProfilePatch) => {
    if (!row) return false;
    if (patch.slug && patch.slug !== row.slug && isReserved(patch.slug)) {
      toast("Ce pseudo est réservé", false);
      return false;
    }
    const update: Record<string, string | null> = {};
    (Object.keys(patch) as (keyof ProfilePatch)[]).forEach((k) => {
      const v = patch[k];
      if ((k === "slug" || k === "displayName") && !v) return; // jamais vides
      update[COLUMNS[k]] = v ? v : null;
    });
    if (Object.keys(update).length === 0) return true;
    const prev = row;
    setRow({ ...row, ...update });
    const { error } = await supabase.from("profiles").update(update).eq("id", row.id);
    if (error) {
      setRow(prev);
      if (error.code === "23505") toast("Ce pseudo est déjà pris", false);
      else if (error.message.includes("slug_reserved")) toast("Ce pseudo est réservé", false);
      else toast(`Profil non enregistré : ${error.message}`, false);
      return false;
    }
    setProfiles((ps) => ps.map((p) => (p.id === row.id ? { ...p, ...update } : p)));
    toast("Profil enregistré");
    return true;
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
        await navigator.share({ title: row?.display_name, url: publicUrl });
      } catch {
        /* partage annulé */
      }
    } else await copyUrl();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/auth");
  };

  const value: Ctx = {
    ready,
    userId,
    plan,
    profiles,
    profileId,
    row,
    profile,
    links,
    setLinks,
    publicUrl,
    activeLinks: links.filter((l) => l.enabled).length,
    maxLinks: ENTITLEMENTS[plan].maxLinks,
    profileLimit: PROFILE_LIMITS[plan],
    canCreateProfile: canCreateProfile(plan, profiles.length),
    selectProfile,
    createNewProfile,
    addLink,
    updateLink,
    deleteLink,
    persistOrder,
    saveProfile,
    copyUrl,
    shareUrl,
    logout,
  };

  return <DashboardCtx.Provider value={value}>{children}</DashboardCtx.Provider>;
}