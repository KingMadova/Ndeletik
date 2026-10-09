"use client";

import { ArrowUpRight } from "lucide-react";
import type { LinkItem } from "@/lib/types";
import { Avatar, Banner, type Profile } from "./ProfileCard";
import { getBlockMeta } from "./blockMeta";

export function PhonePreview({ profile, links }: { profile: Profile; links: LinkItem[] }) {
  const active = links.filter((l) => l.is_active);

  return (
    <div className="mx-auto w-[250px] rounded-[2.2rem] border-[7px] border-ink bg-surface overflow-hidden shadow-xl ring-8 ring-fractal-or/20">
      {/* Encoche */}
      <div className="h-5 bg-surface relative">
        <div className="absolute left-1/2 -translate-x-1/2 top-1 h-3 w-16 rounded-full bg-ink" />
      </div>

      <div className="h-[430px] overflow-y-auto bg-soft [scrollbar-width:none]">
        <Banner url={profile.banner_url} className="h-16" />
        <div className="-mt-8 flex flex-col items-center px-3 pb-4">
          <div className="rounded-full ring-4 ring-surface">
            <Avatar profile={profile} size={64} />
          </div>
          <p className="mt-2 text-sm font-display font-bold text-ink">
            {profile.display_name || profile.username}
          </p>
          {profile.bio && (
            <p className="mt-1 text-[10px] leading-snug text-center text-muted line-clamp-3">{profile.bio}</p>
          )}

          <div className="mt-4 w-full space-y-2">
            {active.length === 0 && (
              <p className="text-center text-[11px] text-muted py-6">Aucun bloc actif</p>
            )}
            {active.map((l, i) => {
              const { Icon, bg } = getBlockMeta(l.url);
              return i === 0 ? (
                <div key={l.id} className="flex items-center justify-between rounded-xl bg-ink text-bg px-3 py-3">
                  <span className="text-[11px] font-semibold truncate">{l.title}</span>
                  <ArrowUpRight size={14} />
                </div>
              ) : (
                <div key={l.id} className="flex items-center gap-2 rounded-xl bg-surface border border-line px-2.5 py-2.5">
                  <span className={`h-6 w-6 rounded-md ${bg} text-white flex items-center justify-center shrink-0`}>
                    <Icon size={12} />
                  </span>
                  <span className="text-[11px] font-semibold text-ink truncate">{l.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}