"use client";

import { Component, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Users, Link2, MousePointerClick, Eye, ArrowLeft, ExternalLink, Crown, Trash2, Shield,
  Globe2, Search, Download, FilterX,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/dashboard/Toast";
import { getCoords } from "@/lib/countryCoords";

const WorldMap = dynamic(
  () => import("@/components/admin/WorldMap").then((m) => m.WorldMap),
  { ssr: false, loading: () => <div className="h-64 rounded-xl bg-soft animate-pulse" /> }
);

const PLAN_COLORS: Record<string, string> = { free: "#F9A825", pro: "#FF6A1A", business: "#C1440E" };
const PLAN_LABELS: Record<string, string> = { free: "Gratuit", pro: "Pro", business: "Business" };
const PLAN_ORDER = ["free", "pro", "business"];

type MapMarker = { lat: number; lon: number; plan: string; count: number; country: string };
type SortKey = "recent" | "old" | "clicks" | "views" | "links" | "az";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "recent", label: "Inscriptions récentes" },
  { id: "old", label: "Inscriptions anciennes" },
  { id: "clicks", label: "Plus de clics" },
  { id: "views", label: "Plus de vues" },
  { id: "links", label: "Plus de liens" },
  { id: "az", label: "Pseudo A → Z" },
];

type Row = {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  country: string | null;
  views: number;
  theme_id: string;
  created_at: string;
  plan: string;
  role: string;
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
          Carte indisponible (npm i d3-geo topojson-client).
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
          <span className="text-[10px] text-muted">comptes</span>
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

const inputCls =
  "rounded-xl border border-line bg-bg px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-fractal-ocre transition-colors";

export default function AdminPage() {
  const router = useRouter();
  const { toast, node: toastNode } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [country, setCountry] = useState("all");
  const [plan, setPlan] = useState("all");
  const [role, setRole] = useState("all");
  const [sort, setSort] = useState<SortKey>("recent");

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace("/auth");

      const [{ data: profs }, { data: accs }, { data: lnks }] = await Promise.all([
        supabase.from("profiles").select("id, user_id, slug, display_name, country, views, theme_id, created_at"),
        supabase.from("accounts").select("user_id, plan, role"),
        supabase.from("links").select("profile_id, clicks"),
      ]);
      if (!alive) return;

      const me = (accs ?? []).find((a: any) => a.user_id === session.user.id);
      if (!me || me.role !== "admin") {
        toast(`Accès admin refusé (rôle : ${me?.role ?? "inconnu"})`, false);
        return router.replace("/dashboard");
      }

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
          country: p.country,
          views: p.views ?? 0,
          theme_id: p.theme_id,
          created_at: p.created_at,
          plan: accByUser.get(p.user_id)?.plan ?? "free",
          role: accByUser.get(p.user_id)?.role ?? "user",
          links_count: linkAgg.get(p.id)?.count ?? 0,
          clicks_total: linkAgg.get(p.id)?.clicks ?? 0,
        }))
      );
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [router, toast]);

  const countryOptions = useMemo(() => {
    const m = new Map<string, number>();
    rows.forEach((r) => {
      const c = r.country?.trim();
      if (c) m.set(c, (m.get(c) ?? 0) + 1);
    });
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], "fr"));
  }, [rows]);

  const filtered = useMemo(() => {
    const nq = q.trim().toLowerCase();
    const list = rows.filter((r) => {
      if (nq && !(r.slug.toLowerCase().includes(nq) || r.display_name.toLowerCase().includes(nq))) return false;
      if (country !== "all" && (r.country?.trim() ?? "—") !== country) return false;
      if (plan !== "all" && r.plan !== plan) return false;
      if (role !== "all" && r.role !== role) return false;
      return true;
    });
    switch (sort) {
      case "old":
        return [...list].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
      case "clicks":
        return [...list].sort((a, b) => b.clicks_total - a.clicks_total);
      case "views":
        return [...list].sort((a, b) => b.views - a.views);
      case "links":
        return [...list].sort((a, b) => b.links_count - a.links_count);
      case "az":
        return [...list].sort((a, b) => a.slug.localeCompare(b.slug, "fr"));
      default:
        return [...list].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    }
  }, [rows, q, country, plan, role, sort]);

  const hasFilters = q !== "" || country !== "all" || plan !== "all" || role !== "all";
  const resetFilters = () => {
    setQ("");
    setCountry("all");
    setPlan("all");
    setRole("all");
  };

  const exportCsv = () => {
    const header = ["pseudo", "nom_affiche", "pays", "plan", "role", "theme", "liens", "clics", "vues", "inscrit_le"];
    const lines = filtered.map((r) =>
      [
        r.slug,
        r.display_name,
        r.country ?? "",
        r.plan,
        r.role,
        r.theme_id,
        r.links_count,
        r.clicks_total,
        r.views,
        new Date(r.created_at).toLocaleDateString("fr-FR"),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ndeletik-utilisateurs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Export CSV : ${filtered.length} ligne(s)`);
  };

  const toggleRole = async (r: Row) => {
    const next = r.role === "admin" ? "user" : "admin";
    const { error } = await supabase.from("accounts").update({ role: next }).eq("user_id", r.user_id);
    if (error) return toast("Modification échouée", false);
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, role: next } : x)));
    toast(`@${r.slug} → ${next}`);
  };

  const deleteUser = async (r: Row) => {
    if (!confirm(`Supprimer définitivement @${r.slug}, ses liens et son compte ?`)) return;
    const { error: e1 } = await supabase.from("profiles").delete().eq("id", r.id);
    const { error: e2 } = await supabase.from("accounts").delete().eq("user_id", r.user_id);
    if (e1 || e2) return toast("Suppression échouée", false);
    setRows((prev) => prev.filter((x) => x.id !== r.id));
    toast(`@${r.slug} supprimé`);
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
      views: acc.views + r.views,
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="text-sm font-semibold">
              Utilisateurs{" "}
              <span className="text-muted font-normal">
                ({filtered.length} affiché{filtered.length > 1 ? "s" : ""} sur {rows.length})
              </span>
            </h2>
            <div className="flex items-center gap-2">
              {hasFilters && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:border-fractal-ocre hover:text-fractal-terra transition-colors"
                >
                  <FilterX size={12} /> Réinitialiser
                </button>
              )}
              <button
                onClick={exportCsv}
                className="inline-flex items-center gap-1.5 rounded-full bg-fractal-ocre hover:bg-fractal-terra px-3 py-1.5 text-xs font-semibold text-white transition-colors"
              >
                <Download size={12} /> Export CSV
              </button>
            </div>
          </div>

          <div className="grid gap-3 border-b border-line bg-soft/40 px-5 py-4 sm:grid-cols-2 lg:grid-cols-5">
            <label className="relative lg:col-span-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher un pseudo ou un nom…"
                className={`${inputCls} w-full pl-9`}
              />
            </label>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className={`${inputCls} w-full`} aria-label="Filtrer par pays">
              <option value="all">Tous les pays</option>
              {countryOptions.map(([c, n]) => (
                <option key={c} value={c}>
                  {c} ({n})
                </option>
              ))}
            </select>
            <select value={plan} onChange={(e) => setPlan(e.target.value)} className={`${inputCls} w-full`} aria-label="Filtrer par plan">
              <option value="all">Tous les plans</option>
              {PLAN_ORDER.map((p) => (
                <option key={p} value={p}>
                  {PLAN_LABELS[p]}
                </option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={`${inputCls} w-full`} aria-label="Trier">
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  Tri : {s.label}
                </option>
              ))}
            </select>
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
                  <th className="px-3 py-3 font-medium">Thème</th>
                  <th className="px-3 py-3 font-medium">Rôle</th>
                  <th className="px-3 py-3 font-medium">Inscrit le</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center">
                      <p className="text-sm font-semibold mb-1">Aucun utilisateur ne correspond</p>
                      <p className="text-xs text-muted mb-3">Modifie ta recherche ou tes filtres.</p>
                      <button
                        onClick={resetFilters}
                        className="rounded-full border border-line px-4 py-2 text-xs text-muted hover:border-fractal-ocre hover:text-fractal-terra transition-colors"
                      >
                        Réinitialiser les filtres
                      </button>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="border-b border-line/60 last:border-0 hover:bg-soft/60 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium">@{r.slug}</div>
                        <div className="text-xs text-muted">{r.display_name}</div>
                      </td>
                      <td className="px-3 py-3 text-muted">{r.country ?? "—"}</td>
                      <td className="px-3 py-3 text-center">{r.links_count}</td>
                      <td className="px-3 py-3 text-center">{r.clicks_total}</td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                          <span className="h-2 w-2 rounded-full" style={{ background: PLAN_COLORS[r.plan] ?? PLAN_COLORS.free }} />
                          {PLAN_LABELS[r.plan] ?? r.plan}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted">{r.theme_id}</td>
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
                            href={`/@${r.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Voir la page de ${r.slug}`}
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
                  ))
                )}
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