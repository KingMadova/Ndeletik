"use client";

import { ArrowUpRight } from "lucide-react";
import type { LinkItem, Profile } from "@/lib/themes/types";
import { getBlockMeta } from "./blockMeta";

export function PhonePreview({ profile, links }: { profile: Profile; links: LinkItem[] }) {
  const active = links.filter((l) => l.enabled !== false);

  return (
    <div className="mx-auto w-[250px] rounded-[2.2rem] border-[7px] border-ink bg-surface overflow-hidden shadow-xl ring-8 ring-fractal-or/20">
      {/* Encoche */}
      <div className="h-5 bg-surface relative">
        <div className="absolute left-1/2 -translate-x-1/2 top-1 h-3 w-16 rounded-full bg-ink" />
      </div>

      <div className="h-[430px] overflow-y-auto bg-soft [scrollbar-width:none]">
        {profile.coverUrl && (
          <div
            className="h-16 bg-cover bg-center"
            style={{ backgroundImage: `url(${profile.coverUrl})` }}
          />
        )}
        <div className={`${profile.coverUrl ? "-mt-8" : "mt-4"} flex flex-col items-center px-3 pb-4`}>
          <div className="rounded-full ring-4 ring-surface">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-fractal-ocre text-white flex items-center justify-center font-bold text-xl">
                {profile.displayName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <p className="mt-2 text-sm font-display font-bold text-ink">
            {profile.displayName || profile.slug}
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