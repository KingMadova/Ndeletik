"use client";

import { Component, type ReactNode } from "react";
import { PLAN_COLORS, PLAN_LABELS, PLAN_ORDER } from "@/lib/admin-types";

export class MapBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
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

export function Sparkline({ data }: { data: number[] }) {
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

export function PlanDonut({ counts }: { counts: Record<string, number> }) {
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
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label="Répartition des comptes par plan">
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
            <span className="w-10 text-right text-xs text-muted">{Math.round(((counts[s.p] ?? 0) / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
