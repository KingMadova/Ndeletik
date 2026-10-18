import { getCoords } from "@/lib/countryCoords";
import { PLAN_ORDER, type AdminRow } from "@/lib/admin-types";

export type MapMarker = { lat: number; lon: number; plan: string; count: number; country: string };

/** Agrégats de la vue d'ensemble (calculés côté navigateur, comme avant). */
export function computeStats(rows: AdminRow[]) {
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
  const buckets: number[] = Array(8).fill(0);
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
        markers.push({ lat: c.lat + (idx - 1) * 1.6, lon: c.lon + (idx - 1) * 1.6, plan: p, count: c.plans[p], country: c.country });
      }
    });
  });

  const topCountries = [...countryAgg.values()].sort((a, b) => b.total - a.total).slice(0, 5);
  return { totals, planCounts, buckets, markers, unlocated, topCountries };
}
