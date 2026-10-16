"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Globe, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { DbLink } from "@/lib/dashboard-types";
import { AnalyticsChart } from "./AnalyticsChart";

type TrafficSource = { name: string; count: number; percentage: number };
type CountryData = { country: string; count: number };

type Props = {
  open: boolean;
  onClose: () => void;
  link: DbLink | null;
  profile: { id: string };
};

export function LinkAnalyticsModal({ open, onClose, link, profile }: Props) {
  const [sources, setSources] = useState<TrafficSource[]>([]);
  const [countries, setCountries] = useState<CountryData[]>([]);

  useEffect(() => {
    if (!open || !link) return;

    (async () => {
      const { data: clicks } = await supabase
        .from("link_clicks")
        .select("referrer, country")
        .eq("link_id", link.id);

      // Sources de trafic
      const referrers = (clicks ?? []).map((c: any) => c.referrer).filter(Boolean);
      const sourceMap = new Map<string, number>();
      referrers.forEach((r: string) => {
        const source = extractSource(r);
        sourceMap.set(source, (sourceMap.get(source) ?? 0) + 1);
      });

      const total = referrers.length || 1;
      const sourcesList: TrafficSource[] = Array.from(sourceMap.entries())
        .map(([name, count]) => ({ name, count, percentage: (count / total) * 100 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setSources(sourcesList);

      // Pays
      const countryMap = new Map<string, number>();
      (clicks ?? []).forEach((c: any) => {
        if (c.country) {
          countryMap.set(c.country, (countryMap.get(c.country) ?? 0) + 1);
        }
      });

      const countriesList: CountryData[] = Array.from(countryMap.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setCountries(countriesList);
    })();
  }, [open, link]);

  const extractSource = (url: string): string => {
    try {
      const domain = new URL(url).hostname.replace(/^www\./, "");
      if (domain.includes("instagram")) return "Instagram";
      if (domain.includes("tiktok")) return "TikTok";
      if (domain.includes("facebook") || domain.includes("fb")) return "Facebook";
      if (domain.includes("twitter") || domain.includes("x.com")) return "X (Twitter)";
      if (domain.includes("youtube")) return "YouTube";
      if (domain.includes("linkedin")) return "LinkedIn";
      if (domain.includes("google")) return "Google";
      return domain;
    } catch {
      return "Direct";
    }
  };

  if (!open || !link) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-surface rounded-3xl border border-line shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface border-b border-line px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-display font-bold">{link.title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-soft text-muted">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <AnalyticsChart profile={profile} linkId={link.id} />

          {sources.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Globe size={16} className="text-fractal-ocre" />
                <h3 className="text-sm font-semibold">Sources de trafic</h3>
              </div>
              <ul className="space-y-3">
                {sources.map((s) => (
                  <li key={s.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-muted">{s.count} ({s.percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-line/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.percentage}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-2 rounded-full bg-gradient-to-r from-fractal-ocre to-fractal-terra"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {countries.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-fractal-ocre" />
                <h3 className="text-sm font-semibold">Pays visiteurs</h3>
              </div>
              <ul className="space-y-2">
                {countries.map((c) => (
                  <li key={c.country} className="flex justify-between text-sm">
                    <span>{c.country}</span>
                    <span className="text-muted">{c.count} clics</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}