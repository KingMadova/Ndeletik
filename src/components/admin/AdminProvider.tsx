"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { fmtDate, type AdminRow } from "@/lib/admin-types";
import { ToastProvider, useToast } from "@/components/dashboard/Toast";

type Status = "loading" | "denied" | "ready";

type Ctx = {
  status: Status;
  meId: string | null;
  rows: AdminRow[];
  /** Admin → utilisateur ou l'inverse (concerne tous les profils du compte). */
  toggleRole: (r: AdminRow) => Promise<boolean>;
  /** Supprime le profil ; supprime aussi le compte s'il n'en reste aucun autre. */
  deleteUser: (r: AdminRow) => Promise<boolean>;
  exportCsv: (list: AdminRow[]) => void;
};

const AdminCtx = createContext<Ctx | null>(null);

export function useAdmin(): Ctx {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error("useAdmin doit être utilisé dans <AdminProvider>");
  return ctx;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <Inner>{children}</Inner>
    </ToastProvider>
  );
}

function Inner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<Status>("loading");
  const [meId, setMeId] = useState<string | null>(null);
  const [rows, setRows] = useState<AdminRow[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace("/auth");

      const [{ data: profs }, { data: accs }, { data: lnks }] = await Promise.all([
        supabase.from("profiles").select("id, user_id, slug, display_name, avatar_url, country, views, theme_id, created_at"),
        supabase.from("accounts").select("user_id, plan, role"),
        supabase.from("links").select("profile_id, clicks"),
      ]);
      if (!alive) return;

      const me = (accs ?? []).find((a: any) => a.user_id === session.user.id);
      setMeId(session.user.id);
      if (!me || me.role !== "admin") return setStatus("denied");

      const accByUser = new Map<string, any>((accs ?? []).map((a: any) => [a.user_id, a]));
      const linkAgg = new Map<string, { count: number; clicks: number }>();
      (lnks ?? []).forEach((l: any) => {
        const a = linkAgg.get(l.profile_id) ?? { count: 0, clicks: 0 };
        a.count += 1;
        a.clicks += l.clicks ?? 0;
        linkAgg.set(l.profile_id, a);
      });

      setRows(
        ((profs ?? []) as any[]).map((p) => ({
          id: p.id,
          user_id: p.user_id,
          slug: p.slug,
          display_name: p.display_name,
          avatar_url: p.avatar_url ?? null,
          country: p.country ?? null,
          views: p.views ?? 0,
          theme_id: p.theme_id,
          created_at: p.created_at,
          plan: accByUser.get(p.user_id)?.plan ?? "free",
          role: accByUser.get(p.user_id)?.role ?? "user",
          links_count: linkAgg.get(p.id)?.count ?? 0,
          clicks_total: linkAgg.get(p.id)?.clicks ?? 0,
        }))
      );
      setStatus("ready");
    })();
    return () => {
      alive = false;
    };
  }, [router]);

  const toggleRole = useCallback(
    async (r: AdminRow) => {
      if (r.user_id === meId) {
        toast("Tu ne peux pas modifier ton propre rôle.", false);
        return false;
      }
      const next = r.role === "admin" ? "user" : "admin";
      const { error } = await supabase.from("accounts").update({ role: next }).eq("user_id", r.user_id);
      if (error) {
        toast("Modification du rôle échouée", false);
        return false;
      }
      setRows((prev) => prev.map((x) => (x.user_id === r.user_id ? { ...x, role: next } : x)));
      toast(next === "admin" ? `@${r.slug} est maintenant administrateur` : `@${r.slug} n'est plus administrateur`);
      return true;
    },
    [meId, toast]
  );

  const deleteUser = useCallback(
    async (r: AdminRow) => {
      if (r.user_id === meId) {
        toast("Tu ne peux pas supprimer ton propre compte depuis l'admin.", false);
        return false;
      }
      const { error: e1 } = await supabase.from("profiles").delete().eq("id", r.id);
      if (e1) {
        toast("Suppression échouée", false);
        return false;
      }
      // Le compte n'est supprimé que s'il ne reste plus aucun profil pour cet utilisateur.
      const remaining = rows.filter((x) => x.user_id === r.user_id && x.id !== r.id).length;
      if (remaining === 0) {
        const { error: e2 } = await supabase.from("accounts").delete().eq("user_id", r.user_id);
        if (e2) toast("Profil supprimé, mais le compte n'a pas pu l'être", false);
      }
      setRows((prev) => prev.filter((x) => x.id !== r.id));
      toast(`@${r.slug} supprimé`);
      return true;
    },
    [meId, rows, toast]
  );

  const exportCsv = useCallback(
    (list: AdminRow[]) => {
      const header = ["pseudo", "nom_affiche", "pays", "plan", "role", "theme", "liens", "clics", "vues", "inscrit_le"];
      const lines = list.map((r) =>
        [r.slug, r.display_name, r.country ?? "", r.plan, r.role, r.theme_id, r.links_count, r.clicks_total, r.views, fmtDate(r.created_at)]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      );
      const blob = new Blob(["\uFEFF" + [header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ndeletik-utilisateurs-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast(`Export CSV : ${list.length} ligne(s)`);
    },
    [toast]
  );

  const value = useMemo(
    () => ({ status, meId, rows, toggleRole, deleteUser, exportCsv }),
    [status, meId, rows, toggleRole, deleteUser, exportCsv]
  );

  return <AdminCtx.Provider value={value}>{children}</AdminCtx.Provider>;
}
