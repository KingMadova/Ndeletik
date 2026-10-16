"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

type ClickData = { date: string; count: number };

type Props = {
  profile: { id: string };
  linkId?: string; // Si fourni, filtre sur ce lien
};

export function AnalyticsChart({ profile, linkId }: Props) {
  const [data, setData] = useState<ClickData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let query = supabase
        .from("link_clicks")
        .select("created_at")
        .eq("profile_id", profile.id)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (linkId) {
        query = query.eq("link_id", linkId);
      }

      const { data: clicks } = await query;

      // Grouper par jour
      const dayMap = new Map<string, number>();
      (clicks ?? []).forEach((c: any) => {
        const day = new Date(c.created_at).toISOString().split("T")[0];
        dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
      });

      // Remplir les jours vides
      const result: ClickData[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split("T")[0];
        result.push({ date: key, count: dayMap.get(key) ?? 0 });
      }

      setData(result);
      setLoading(false);
    })();
  }, [profile.id, linkId]);

  if (loading) {
    return <div className="h-48 bg-soft rounded-xl animate-pulse" />;
  }

  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Clics (30 derniers jours)</h3>
        <span className="text-2xl font-display font-bold text-fractal-ocre">{total}</span>
      </div>
      <div className="flex items-end gap-1 h-32">
        {data.map((d, i) => (
          <motion.div
            key={d.date}
            initial={{ height: 0 }}
            animate={{ height: `${(d.count / max) * 100}%` }}
            transition={{ delay: i * 0.02, duration: 0.3 }}
            className="flex-1 bg-gradient-to-t from-fractal-ocre to-fractal-terra rounded-t hover:opacity-80 transition-opacity cursor-pointer group relative"
            title={`${d.date}: ${d.count} clics`}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-ink text-bg text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {d.count}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted mt-2">
        <span>{new Date(data[0]?.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
        <span>{new Date(data[data.length - 1]?.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
      </div>
    </div>
  );
}