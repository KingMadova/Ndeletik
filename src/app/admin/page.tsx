"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Users, Link2, MousePointerClick, Eye, ArrowLeft, ExternalLink, Crown, Trash2, Shield, Globe2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/dashboard/Toast";
import { getCoords } from "@/lib/countryCoords";

// Carte chargée en dynamique : si d3-geo manque ou crashe, le reste de la page vit.
const WorldMap = dynamic(
  () => import("@/components/admin/WorldMap").then((m) => m.WorldMap),
  { ssr: false, loading: () => <div className="h-64 rounded-xl bg-soft animate-pulse" /> }
);

const PLAN_COLORS: Record<string, string> = {
  free: "#F9A825",
  pro: "#FF6A1A",
  business: "#C1440E",
};
const PLAN_LABELS: Record<string, string> = {
  free: "Gratuit",
  pro: "Pro",
  business: "Business",
};
const PLAN_ORDER = ["free", "pro", "business"];

type MapMarker = { lat: number; lon: number; plan: string; count: number; country: string };

type Row = {
  id: string;
  username: string;
  display_name: string | null;
  country: string | null;
  views: number | null;
  role: string;
  plan: string;
  created_at: string;
  links_count: number;
  clicks_total: number;
};

class MapBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-64 items-center justify-center rounded-xl bg-soft text-sm text-muted">
          Carte indisponible (dépendances carte à installer : npm i d3-geo topojson-client).
        </div>
      );
    }
    return this.props.children;
  }
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(1, ...data);
  const pts = data
    .map((v, i) => `${(i / Math.max(1, data.length - 1)) * 100},${26 - (v / max) * 20 - 3}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 30" className="h-8 w-full" preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} fill="none" stroke="#FF6A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlanDonut({ counts }: { counts: Record<string, number> }) {
  const total = Math.max(1, PLAN_ORDER.reduce((s, p) => s + (counts[p] ?? 0), 0));
  const R = 40;
  const C = 2 * Math.PI * R;
  let acc = 0;
  const segs = PLAN_ORDER.map((p) => {
    const frac = (counts[p] ?? 0) / total;
    const s = { p, frac, offset: acc };
    acc += frac;
    return s;
  });
  return (
    <div className="flex items-center gap-5">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--color-soft)" strokeWidth="13" />
          {segs.map(
            (s) =>
              s.frac > 0 && (
                <circle
                  key={s.p}
                  cx="50"
                  cy="50"
                  r={R}
                  fill="none"
                  stroke={PLAN_COLORS[s.p]}
                  strokeWidth="13"
                  strokeDasharray={`${C * s.frac} ${C}`}
                  strokeDashoffset={-C * s.offset}
                />
              )
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-extrabold">{total}</span>
          <span className="text-[10px] text-muted">abonnés</span>
        </div>
      </div>
      <ul className="flex-1 space-y-2 text-sm">
        {segs.map((s) => (
          <li key={s.p} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: PLAN_COLORS[s.p] }} />
            <span className="text-muted">{PLAN_LABELS[s.p]}</span>
            <span className="ml-auto font-semibold">{counts[s.p] ?? 0}</span>
            <span className="w-10 text-right text-xs text-muted">
              {Math.round(((counts[s.p] ?? 0) / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { toast, node: toastNode } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace("/auth");

      const { data: p, error } = await supabase
        .from("profiles")
        .select("role, username")
        .eq("id", session.user.id)
        .single();

      if (!alive) return;

      if (error || !p) {
        toast(`Profil introuvable : ${error?.message ?? "aucune ligne"}`, false);
        return router.replace("/dashboard");
      }
      if (p.role !== "admin") {
        toast(`Connecté en tant que @${p.username} (rôle : ${p.role}) — accès admin refusé`, false);
        return router.replace("/dashboard");
      }

      const [{ data: profiles }, { data: links }] = await Promise.all([
        supabase.from("profiles").select("id, username, display_name, country, views, role, plan, created_at"),
        supabase.from("links").select("user_id, clicks"),
      ]);
      if (!alive) return;

      const agg = new Map<string, { count: number; clicks: number }>();
      (links ?? []).forEach((l: any) => {
        const a = agg.get(l.user_id) ?? { count: 0, clicks: 0 };
        a.count += 1;
        a.clicks += l.clicks ?? 0;
        agg.set(l.user_id, a);
      });
      setRows(
        ((profiles ?? []) as any[])
          .map((x) => ({
            ...x,
            links_count: agg.get(x.id)?.count ?? 0,
            clicks_total: agg.get(x.id)?.clicks ?? 0,
          }))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      );
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [router, toast]);

  const toggleRole = async (r: Row) => {
    const next = r.role === "admin" ? "user" : "admin";
    const { error } = await supabase.from("profiles").update({ role: next }).eq("id", r.id);
    if (error) return toast("Modification échouée", false);
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, role: next } : x)));
    toast(`@${r.username} → ${next}`);
  };

  const deleteUser = async (r: Row) => {
    if (!confirm(`Supprimer définitivement @${r.username} et tous ses liens ?`)) return;
    const { error: e1 } = await supabase.from("links").delete().eq("user_id", r.id);
    const { error: e2 } = await supabase.from("profiles").delete().eq("id", r.id);
    if (e1 || e2) return toast("Suppression échouée", false);
    setRows((prev) => prev.filter((x) => x.id !== r.id));
    toast(`@${r.username} supprimé`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg p-6 animate-pulse">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="h-8 w-48 rounded bg-line/70" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-line/70" />
            ))}
          </div>
          <div className="h-96 rounded-2xl bg-line/70" />
        </div>
      </div>
    );
  }

  const totals = rows.reduce(
    (acc, r) => ({
      users: acc.users + 1,
      links: acc.links + r.links_count,
      clicks: acc.clicks + r.clicks_total,
      views: acc.views + (r.views ?? 0),
    }),
    { users: 0, links: 0, clicks: 0, views: 0 }
  );

  const planCounts: Record<string, number> = { free: 0, pro: 0, business: 0 };
  rows.forEach((r) => {
    planCounts[r.plan] = (planCounts[r.plan] ?? 0) + 1;
  });

  const now = Date.now();
  const buckets = Array(8).fill(0);
  rows.forEach((r) => {
    const w = Math.floor((now - new Date(r.created_at).getTime()) / 604800000);
    if (w >= 0 && w < 8) buckets[7 - w]++;
  });

  const countryAgg = new Map<string, { country: string; total: number; plans: Record<string, number>; lat: number; lon: number }>();
  let unlocated = 0;
  rows.forEach((r) => {
    const coords = getCoords(r.country);
    if (!coords) {
      unlocated++;
      return;
    }
    const key = r.country!.trim().toLowerCase();
    const e = countryAgg.get(key) ?? { country: r.country!.trim(), total: 0, plans: {}, lat: coords[0], lon: coords[1] };
    e.total++;
    e.plans[r.plan] = (e.plans[r.plan] ?? 0) + 1;
    countryAgg.set(key, e);
  });

  const markers: MapMarker[] = [];
  countryAgg.forEach((c) => {
    PLAN_ORDER.forEach((p, idx) => {
      if ((c.plans[p] ?? 0) > 0) {
        markers.push({
          lat: c.lat + (idx - 1) * 1.6,
          lon: c.lon + (idx - 1) * 1.6,
          plan: p,
          count: c.plans[p],
          country: c.country,
        });
      }
    });
  });

  const topCountries = [...countryAgg.values()].sort((a, b) => b.total - a.total).slice(0, 5);
  const maxCountry = Math.max(1, ...topCountries.map((c) => c.total));

  const kpis = [
    { icon: Users, label: "Créateurs inscrits", value: totals.users, sub: `+${buckets[7]} cette semaine`, spark: true },
    { icon: Link2, label: "Liens publiés", value: totals.links, sub: "tous créateurs confondus", spark: false },
    { icon: MousePointerClick, label: "Clics cumulés", value: totals.clicks, sub: "tous liens confondus", spark: false },
    { icon: Eye, label: "Vues cumulées", value: totals.views, sub: "pages publiques", spark: false },
  ];

  return (
    <div className="min-h-screen bg-bg text-ink">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fractal-or via-fractal-ocre to-fractal-terra text-white shadow-soft">
              <Shield size={20} />
            </span>
            <div>
              <h1 className="font-display text-xl font-extrabold">Backoffice YEKOLA</h1>
              <p className="text-xs text-muted">
                {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm text-muted hover:border-fractal-ocre hover:text-fractal-terra transition-colors"
          >
            <ArrowLeft size={14} /> Mon dashboard
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="bg-surface border border-line rounded-2xl p-4 shadow-soft">
              <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-soft text-fractal-ocre">
                <k.icon size={16} />
              </span>
              <div className="font-display text-2xl font-extrabold">
                {new Intl.NumberFormat("fr-FR").format(k.value)}
              </div>
              <div className="text-xs text-muted">{k.label}</div>
              {k.spark ? (
                <>
                  <Sparkline data={buckets} />
                  <div className="text-[11px] font-medium text-fractal-terra">{k.sub}</div>
                </>
              ) : (
                <div className="mt-1 text-[11px] text-muted/80">{k.sub}</div>
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
          <div className="bg-surface border border-line rounded-2xl p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Globe2 size={16} className="text-fractal-ocre" /> Abonnés par pays
              </h2>
              <span className="text-xs text-muted">{markers.length} zone(s) active(s)</span>
            </div>
            <MapBoundary>
              <WorldMap markers={markers} />
            </MapBoundary>
            {unlocated > 0 && (
              <p className="mt-2 text-[11px] text-muted">
                {unlocated} profil(s) sans pays reconnu ne sont pas placés sur la carte.
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-surface border border-line rounded-2xl p-5 shadow-soft">
              <h2 className="mb-4 text-sm font-semibold">Répartition des abonnements</h2>
              <PlanDonut counts={planCounts} />
            </div>
            <div className="bg-surface border border-line rounded-2xl p-5 shadow-soft">
              <h2 className="mb-4 text-sm font-semibold">Top pays</h2>
              {topCountries.length === 0 ? (
                <p className="text-xs text-muted">Aucune donnée de pays pour le moment.</p>
              ) : (
                <ul className="space-y-3">
                  {topCountries.map((c) => {
                    const dominant = PLAN_ORDER.reduce(
                      (a, b) => ((c.plans[a] ?? 0) >= (c.plans[b] ?? 0) ? a : b),
                      "free"
                    );
                    return (
                      <li key={c.country}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="truncate pr-3">{c.country}</span>
                          <span className="text-muted">{c.total}</span>
                        </div>
                        <div className="h-2 rounded-full bg-soft">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(c.total / maxCountry) * 100}%`, background: PLAN_COLORS[dominant] }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-2xl shadow-soft overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-sm font-semibold">Utilisateurs ({rows.length})</h2>
            <span className="text-xs text-muted">du plus récent au plus ancien</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th className="px-5 py-3 font-medium">Utilisateur</th>
                  <th className="px-3 py-3 font-medium">Pays</th>
                  <th className="px-3 py-3 font-medium text-center">Liens</th>
                  <th className="px-3 py-3 font-medium text-center">Clics</th>
                  <th className="px-3 py-3 font-medium">Plan</th>
                  <th className="px-3 py-3 font-medium">Rôle</th>
                  <th className="px-3 py-3 font-medium">Inscrit le</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-line/60 last:border-0 hover:bg-soft/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium">@{r.username}</div>
                      {r.display_name && <div className="text-xs text-muted">{r.display_name}</div>}
                    </td>
                    <td className="px-3 py-3 text-muted">{r.country ?? "—"}</td>
                    <td className="px-3 py-3 text-center">{r.links_count}</td>
                    <td className="px-3 py-3 text-center">{r.clicks_total}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: PLAN_COLORS[r.plan] ?? PLAN_COLORS.free }}
                        />
                        {PLAN_LABELS[r.plan] ?? r.plan}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          r.role === "admin" ? "bg-fractal-ocre/10 text-fractal-terra" : "bg-soft text-muted"
                        }`}
                      >
                        {r.role === "admin" && <Crown size={11} />}
                        {r.role}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted">
                      {new Date(r.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/${r.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Voir la page de ${r.username}`}
                          className="p-1.5 rounded-md text-muted hover:bg-soft hover:text-fractal-terra transition-colors"
                        >
                          <ExternalLink size={15} />
                        </a>
                        <button
                          onClick={() => toggleRole(r)}
                          aria-label="Changer le rôle"
                          className="p-1.5 rounded-md text-muted hover:bg-soft hover:text-fractal-ocre transition-colors"
                        >
                          <Crown size={15} />
                        </button>
                        <button
                          onClick={() => deleteUser(r)}
                          aria-label="Supprimer"
                          className="p-1.5 rounded-md text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-line bg-soft/50 p-6 text-center">
          <p className="text-sm font-semibold">Revenus Mobile Money</p>
          <p className="mt-1 text-xs text-muted">
            Le tableau des commissions (plans Pro/Business + transactions) apparaîtra ici dès l'intégration Sebpay.
          </p>
        </div>
      </div>
      {toastNode}
    </div>
  );
}