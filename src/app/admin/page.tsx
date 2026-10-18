"use client";

import { useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronRight, Eye, Globe2, Link2, MousePointerClick, Users } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { buttonClass } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProfileAvatar } from "@/components/dashboard/ProfileAvatar";
import { useAdmin } from "@/components/admin/AdminProvider";
import { PlanDot } from "@/components/admin/bits";
import { MapBoundary, PlanDonut, Sparkline } from "@/components/admin/charts";
import { computeStats } from "@/components/admin/stats";
import { PLAN_COLORS, PLAN_ORDER, fmt, fmtDate } from "@/lib/admin-types";

const WorldMap = dynamic(() => import("@/components/admin/WorldMap").then((m) => m.WorldMap), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-soft" />,
});

export default function AdminOverviewPage() {
  const { rows } = useAdmin();
  const s = useMemo(() => computeStats(rows), [rows]);
  const latest = useMemo(() => [...rows].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 6), [rows]);
  const maxCountry = Math.max(1, ...s.topCountries.map((c) => c.total));

  const kpis = [
    { icon: Users, label: "Créateurs inscrits", value: s.totals.users, sub: `+${s.buckets[7]} cette semaine`, spark: true },
    { icon: Link2, label: "Liens publiés", value: s.totals.links, sub: "tous créateurs confondus" },
    { icon: MousePointerClick, label: "Clics cumulés", value: s.totals.clicks, sub: "tous liens confondus" },
    { icon: Eye, label: "Vues cumulées", value: s.totals.views, sub: "pages publiques" },
  ];

  return (
    <>
      <PageHeader
        title="Vue d'ensemble"
        description="L'activité de Ndeletik en un coup d'œil."
        actions={
          <Link href="/admin/users" className={buttonClass({ variant: "secondary" })}>
            <Users size={16} aria-hidden /> Voir les utilisateurs
          </Link>
        }
      />

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {kpis.map((k) => (
            <Card key={k.label} className="p-4">
              <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-fractal-ocre/10 text-fractal-ocre">
                <k.icon size={16} aria-hidden />
              </span>
              <div className="font-display text-2xl font-extrabold">{fmt(k.value)}</div>
              <div className="text-xs text-muted">{k.label}</div>
              {k.spark ? (
                <>
                  <Sparkline data={s.buckets} />
                  <div className="text-[11px] font-medium text-fractal-terra">{k.sub}</div>
                </>
              ) : (
                <div className="mt-1 text-[11px] text-muted/80">{k.sub}</div>
              )}
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-sm font-bold">
                <Globe2 size={16} className="text-fractal-ocre" aria-hidden /> Abonnés par pays
              </h2>
              <span className="text-xs text-muted">{s.markers.length} zone(s) active(s)</span>
            </div>
            <MapBoundary>
              <WorldMap markers={s.markers} />
            </MapBoundary>
            {s.unlocated > 0 && (
              <p className="mt-2 text-[11px] text-muted">{s.unlocated} profil(s) sans pays reconnu ne sont pas placés sur la carte.</p>
            )}
          </Card>

          <div className="space-y-4">
            <Card>
              <CardTitle>Répartition des abonnements</CardTitle>
              <PlanDonut counts={s.planCounts} />
            </Card>
            <Card>
              <CardTitle>Top pays</CardTitle>
              {s.topCountries.length === 0 ? (
                <p className="text-xs text-muted">Aucune donnée de pays pour le moment.</p>
              ) : (
                <ul className="space-y-3">
                  {s.topCountries.map((c) => {
                    const dominant = PLAN_ORDER.reduce((a, b) => ((c.plans[a] ?? 0) >= (c.plans[b] ?? 0) ? a : b), "free");
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
            </Card>
          </div>
        </div>

        <Card padded={false}>
          <div className="flex items-center justify-between px-5 pb-2 pt-5">
            <h2 className="font-display text-sm font-bold">Dernières inscriptions</h2>
            <Link href="/admin/users" className="text-xs font-semibold text-fractal-terra hover:underline">
              Tout voir
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {latest.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/users/${r.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-soft/60">
                  <ProfileAvatar profile={r} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">@{r.slug}</p>
                    <p className="truncate text-xs text-muted">
                      {r.display_name} · {fmtDate(r.created_at)}
                    </p>
                  </div>
                  <span className="hidden sm:block">
                    <PlanDot plan={r.plan} />
                  </span>
                  <ChevronRight size={16} className="text-muted" aria-hidden />
                </Link>
              </li>
            ))}
            {latest.length === 0 && <li className="px-5 py-8 text-center text-sm text-muted">Aucune inscription pour le moment.</li>}
          </ul>
        </Card>

        <div className="rounded-2xl border border-dashed border-line bg-soft/50 p-6 text-center">
          <p className="text-sm font-semibold">Revenus Mobile Money</p>
          <p className="mt-1 text-xs text-muted">
            Le tableau des commissions (plans Pro/Business + transactions) apparaîtra ici dès l'intégration Sebpay.
          </p>
        </div>
      </div>
    </>
  );
}
