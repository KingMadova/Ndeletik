"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { BarChart3, Download, Globe, MousePointerClick, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { LinkAnalyticsModal } from "@/components/dashboard/LinkAnalyticsModal";
import { useToast } from "@/components/dashboard/Toast";
import type { DbLink } from "@/lib/dashboard-types";
import { supabase } from "@/lib/supabaseClient";

const WorldMap = dynamic(() => import("@/components/admin/WorldMap").then((m) => m.WorldMap), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-soft" />,
});

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

export default function StatsPage() {
  const d = useDashboard();
  const { toast } = useToast();
  const [sources, setSources] = useState<TrafficSource[]>([]);
  const [markers, setMarkers] = useState<CountryMarker[]>([]);
  const [analyticsLink, setAnalyticsLink] = useState<DbLink | null>(null);

  useEffect(() => {
    if (!d.profileId) return;
    let cancelled = false;
    (async () => {
      const { data: clicks } = await supabase.from("link_clicks").select("referrer, country").eq("profile_id", d.profileId);
      if (cancelled) return;

      const referrers = (clicks ?? []).map((c: any) => c.referrer).filter(Boolean) as string[];
      const sourceMap = new Map<string, number>();
      referrers.forEach((r) => sourceMap.set(extractSource(r), (sourceMap.get(extractSource(r)) ?? 0) + 1));
      const total = referrers.length || 1;
      setSources(
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
          .map(([code, count]) => ({ lat: COUNTRY_COORDS[code][0], lon: COUNTRY_COORDS[code][1], plan: "free", count, country: code }))
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [d.profileId]);

  const totalClicks = useMemo(() => d.links.reduce((s, l) => s + l.clicks, 0), [d.links]);
  const maxClicks = Math.max(1, ...d.links.map((l) => l.clicks));
  const best = useMemo(() => [...d.links].sort((a, b) => b.clicks - a.clicks)[0], [d.links]);

  const exportCsv = async () => {
    if (!d.profileId) return;
    const since = new Date(Date.now() - 90 * 86400000).toISOString();
    const [{ data: clicks }, { data: lnks }] = await Promise.all([
      supabase
        .from("link_clicks")
        .select("created_at, referrer, country, link_id")
        .eq("profile_id", d.profileId)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(5000),
      supabase.from("links").select("id, title").eq("profile_id", d.profileId),
    ]);
    const titles = new Map<string, string>((lnks ?? []).map((l: any) => [l.id, l.title]));
    const rows = (clicks ?? []).map((c: any) => [
      new Date(c.created_at).toLocaleString("fr-FR"),
      titles.get(c.link_id) ?? "(lien supprimé)",
      extractSource(c.referrer ?? ""),
      c.country ?? "",
    ]);
    const csv = [["date", "lien", "source", "pays"], ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `ndeletik-clics-90j-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Export CSV : ${rows.length} clic(s) sur 90 jours`);
  };

  if (!d.profileId) return null;

  return (
    <>
      <PageHeader
        title="Statistiques"
        description="Qui clique sur tes liens, et d'où viennent tes visiteurs."
        actions={
          <Button variant="secondary" onClick={exportCsv}>
            <Download size={16} aria-hidden /> Export CSV
          </Button>
        }
      />

      {d.links.length === 0 ? (
        <EmptyState
          icon={<BarChart3 size={22} aria-hidden />}
          title="Pas encore de statistiques"
          description="Ajoute des liens à ta page et partage-la : les clics apparaîtront ici."
        />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Kpi icon={<MousePointerClick size={18} aria-hidden />} label="Clics au total" value={String(totalClicks)} />
            <Kpi icon={<BarChart3 size={18} aria-hidden />} label="Liens actifs" value={`${d.activeLinks} / ${d.links.length}`} />
            <Kpi icon={<Trophy size={18} aria-hidden />} label="Lien le plus cliqué" value={best && best.clicks > 0 ? best.title : "—"} small />
          </div>

          <AnalyticsChart profile={{ id: d.profileId }} />

          <div className="grid gap-6 lg:grid-cols-2">
            {sources.length > 0 && (
              <Card>
                <CardTitle hint="Les 5 premières provenances.">Sources de trafic</CardTitle>
                <ul className="space-y-3">
                  {sources.map((s) => (
                    <li key={s.name}>
                      <div className="mb-1 flex justify-between text-sm">
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
              </Card>
            )}

            <Card className={sources.length === 0 ? "lg:col-span-2" : undefined}>
              <CardTitle hint="Clique sur un lien pour voir son détail.">Détail par lien</CardTitle>
              <ul className="space-y-3">
                {[...d.links]
                  .sort((a, b) => b.clicks - a.clicks)
                  .map((l) => (
                    <li key={l.id}>
                      <button type="button" onClick={() => setAnalyticsLink(l)} className="group w-full text-left">
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="truncate pr-3 font-medium transition-colors group-hover:text-fractal-terra">{l.title}</span>
                          <span className="shrink-0 text-muted">{l.clicks} clics</span>
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
            </Card>
          </div>

          {markers.length > 0 && (
            <Card>
              <CardTitle>
                <span className="inline-flex items-center gap-2">
                  <Globe size={16} className="text-fractal-ocre" aria-hidden /> Pays de tes visiteurs
                </span>
              </CardTitle>
              <WorldMap markers={markers} />
            </Card>
          )}
        </div>
      )}

      <LinkAnalyticsModal open={!!analyticsLink} onClose={() => setAnalyticsLink(null)} link={analyticsLink} profile={{ id: d.profileId }} />
    </>
  );
}

function Kpi({ icon, label, value, small }: { icon: React.ReactNode; label: string; value: string; small?: boolean }) {
  return (
    <Card className="flex items-center gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-fractal-ocre/10 text-fractal-ocre">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className={small ? "truncate font-display text-base font-extrabold text-ink" : "font-display text-2xl font-extrabold text-ink"}>{value}</p>
      </div>
    </Card>
  );
}
