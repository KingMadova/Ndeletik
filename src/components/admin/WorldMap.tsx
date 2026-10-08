"use client";
import { useEffect, useMemo, useState } from "react";
import { geoEquirectangular, geoPath } from "d3-geo";
import { feature } from "topojson-client";

export const PLAN_COLORS: Record<string, string> = {
  free: "#F9A825",
  pro: "#FF6A1A",
  business: "#C1440E",
};

export const PLAN_LABELS: Record<string, string> = {
  free: "Gratuit",
  pro: "Pro",
  business: "Business",
};

export type MapMarker = {
  lat: number;
  lon: number;
  plan: string;
  count: number;
  country: string;
};

const WIDTH = 800;
const HEIGHT = 400;

export function WorldMap({ markers }: { markers: MapMarker[] }) {
  const [geographies, setGeographies] = useState<any[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((r) => r.json())
      .then((topo: any) => {
        const fc: any = feature(topo, topo.objects.countries);
        setGeographies(fc.features);
      })
      .catch(() => setFailed(true));
  }, []);

  const projection = useMemo(
    () =>
      geoEquirectangular().fitExtent(
        [
          [0, 0],
          [WIDTH, HEIGHT],
        ],
        { type: "Sphere" } as any
      ),
    []
  );
  const path = useMemo(() => geoPath(projection), [projection]);

  if (failed) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-soft text-sm text-muted">
        Carte indisponible (connexion requise pour charger le fond de carte).
      </div>
    );
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        role="img"
        aria-label="Carte mondiale des abonnés"
      >
        <path
          d={path({ type: "Sphere" } as any) ?? ""}
          fill="#FBF7F1"
          stroke="var(--color-line)"
          strokeWidth={0.6}
        />
        {geographies.length === 0 ? (
          <rect
            x="0"
            y="0"
            width={WIDTH}
            height={HEIGHT}
            fill="var(--color-soft)"
            className="animate-pulse"
          />
        ) : (
          geographies.map((g: any, i: number) => (
            <path key={g.id ?? i} d={path(g) ?? ""} fill="#EDE4D8" stroke="#FFFFFF" strokeWidth={0.5} />
          ))
        )}
        {markers.map((m, i) => {
          const xy = projection([m.lon, m.lat]);
          if (!xy) return null;
          const [x, y] = xy;
          const r = 3 + Math.min(7, Math.sqrt(m.count) * 1.4);
          const color = PLAN_COLORS[m.plan] ?? PLAN_COLORS.free;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={r * 2} fill={color} opacity={0.18} />
              <circle cx={x} cy={y} r={r} fill={color} opacity={0.9} stroke="#FFFFFF" strokeWidth={1.2}>
                <title>{`${m.country} — ${PLAN_LABELS[m.plan]} : ${m.count}`}</title>
              </circle>
            </g>
          );
        })}
      </svg>

      {/* Légende */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
        {(Object.keys(PLAN_COLORS) as string[]).map((p) => (
          <span key={p} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: PLAN_COLORS[p] }} />
            {PLAN_LABELS[p]}
          </span>
        ))}
        <span className="ml-auto text-[11px]">Survole un point pour le détail</span>
      </div>
    </div>
  );
}