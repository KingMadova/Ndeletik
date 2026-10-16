"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { ChevronsUpDown, Copy, ExternalLink, LogOut, Plus, Share2 } from "lucide-react";
import { clsx } from "clsx";
import { Wordmark } from "@/components/landing/ui";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { PLAN_LABEL } from "@/lib/dashboard-types";
import { useDashboard } from "./DashboardProvider";
import { OfflineBanner } from "./OfflineBanner";
import { ProfileAvatar } from "./ProfileAvatar";
import { NAV, isActive } from "./nav";

/**
 * Cadre commun de tout l'espace connecté : menu latéral (ordinateur), barre d'onglets (mobile)
 * et barre supérieure avec le lien public toujours à portée de main.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const d = useDashboard();
  const pathname = usePathname();

  if (!d.ready || !d.row) return <ShellSkeleton />;

  return (
    <div className="min-h-screen bg-bg text-ink">
      <OfflineBanner />

      {/* Menu latéral : ordinateur */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-surface lg:flex">
        <div className="px-5 pb-4 pt-5">
          <Link href="/dashboard" aria-label="Ndeletik, tableau de bord">
            <Wordmark />
          </Link>
        </div>

        <div className="px-3">
          <ProfileSwitcher />
        </div>

        <nav aria-label="Navigation du tableau de bord" className="mt-5 flex-1 space-y-1 overflow-y-auto px-3">
          {NAV.map((item) => {
            const active = isActive(item, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active ? "bg-fractal-ocre/10 font-semibold text-fractal-terra" : "font-medium text-muted hover:bg-soft hover:text-ink"
                )}
              >
                {active && (
                  <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-gradient-to-b from-fractal-or via-fractal-ocre to-fractal-terra" />
                )}
                <item.icon size={18} aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-line p-3">
          <PlanCard />
          <button
            type="button"
            onClick={d.logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-soft hover:text-ink"
          >
            <LogOut size={18} aria-hidden /> Déconnexion
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* Barre supérieure : profil (mobile) + lien public */}
        <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
            <div className="lg:hidden">
              <MobileProfile />
            </div>
            <PublicLinkBar />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:pb-12">{children}</main>
      </div>

      {/* Onglets du bas : mobile */}
      <nav
        aria-label="Navigation du tableau de bord"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {NAV.map((item) => {
            const active = isActive(item, pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                    active ? "text-fractal-terra" : "text-muted"
                  )}
                >
                  {active && (
                    <span className="absolute inset-x-6 top-0 h-0.5 rounded-b-full bg-gradient-to-r from-fractal-or via-fractal-ocre to-fractal-terra" />
                  )}
                  <item.icon size={20} aria-hidden />
                  {item.short}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

/* ---------- Lien public (copier / partager / voir) ---------- */
function PublicLinkBar() {
  const { publicUrl, copyUrl, shareUrl, row } = useDashboard();
  if (!row) return null;
  const short = publicUrl.replace(/^https?:\/\//, "");

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 lg:justify-end">
      <div className="flex min-w-0 items-center gap-1 rounded-full border border-line bg-surface py-1 pl-4 pr-1 shadow-soft">
        <span className="truncate text-sm text-muted">{short}</span>
        <button
          type="button"
          onClick={copyUrl}
          aria-label="Copier le lien de ma page"
          title="Copier le lien"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft text-muted transition-colors hover:text-fractal-terra"
        >
          <Copy size={14} aria-hidden />
        </button>
      </div>
      <button type="button" onClick={shareUrl} className={buttonClass({ size: "sm", className: "hidden sm:inline-flex" })}>
        <Share2 size={14} aria-hidden /> Partager
      </button>
      <a
        href={`/@${row.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Voir ma page publique"
        title="Voir ma page"
        className={buttonClass({ variant: "secondary", size: "sm", className: "!px-2.5" })}
      >
        <ExternalLink size={14} aria-hidden />
      </a>
    </div>
  );
}

/* ---------- Sélecteur de profil ---------- */
function ProfileSwitcher() {
  const { profiles, profileId, row, selectProfile, createNewProfile, profileLimit, canCreateProfile } = useDashboard();
  if (!row) return null;
  const multi = profiles.length > 1;

  return (
    <div>
      <div className="relative rounded-2xl border border-line bg-bg p-3">
        <div className="flex items-center gap-3">
          <ProfileAvatar profile={row} size={40} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{row.display_name}</p>
            <p className="truncate text-xs text-muted">@{row.slug}</p>
          </div>
          {multi && <ChevronsUpDown size={16} className="shrink-0 text-muted" aria-hidden />}
        </div>
        {multi && (
          <select
            aria-label="Changer de profil"
            value={profileId ?? ""}
            onChange={(e) => selectProfile(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.display_name} (@{p.slug})
              </option>
            ))}
          </select>
        )}
      </div>
      <button
        type="button"
        onClick={createNewProfile}
        className={clsx(
          "mt-2 flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors hover:bg-soft",
          canCreateProfile ? "text-fractal-terra" : "text-muted"
        )}
      >
        <span className="flex items-center gap-1.5">
          <Plus size={14} aria-hidden /> Nouveau profil
        </span>
        <span>
          {profiles.length}/{profileLimit}
        </span>
      </button>
    </div>
  );
}

function MobileProfile() {
  const { profiles, profileId, row, selectProfile } = useDashboard();
  if (!row) return null;
  const multi = profiles.length > 1;
  return (
    <div className="relative">
      <ProfileAvatar profile={row} size={36} />
      {multi && (
        <select
          aria-label="Changer de profil"
          value={profileId ?? ""}
          onChange={(e) => selectProfile(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.display_name} (@{p.slug})
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function PlanCard() {
  const { plan } = useDashboard();
  return (
    <div className="rounded-2xl bg-soft p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-ink">Mon plan</span>
        <Badge tone="brand">{PLAN_LABEL[plan]}</Badge>
      </div>
      {plan === "free" && (
        <>
          <p className="mt-2 text-xs text-muted">Liens illimités, thèmes Pro et couleurs personnalisées.</p>
          <Link href="/#tarifs" className={buttonClass({ size: "sm", full: true, className: "mt-2" })}>
            Passer au Pro
          </Link>
        </>
      )}
    </div>
  );
}

function ShellSkeleton() {
  return (
    <div className="min-h-screen bg-bg" role="status" aria-label="Chargement du tableau de bord">
      <div className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-surface p-5 lg:block">
        <div className="h-7 w-32 animate-pulse rounded bg-line/70" />
        <div className="mt-6 h-16 animate-pulse rounded-2xl bg-line/60" />
        <div className="mt-6 space-y-2">
          {NAV.map((n) => (
            <div key={n.href} className="h-10 animate-pulse rounded-xl bg-line/50" />
          ))}
        </div>
      </div>
      <div className="lg:pl-64">
        <div className="h-16 border-b border-line" />
        <div className="mx-auto max-w-6xl space-y-4 px-4 pt-8 sm:px-6">
          <div className="h-9 w-48 animate-pulse rounded bg-line/70" />
          <div className="h-24 animate-pulse rounded-2xl bg-line/60" />
          <div className="h-64 animate-pulse rounded-2xl bg-line/60" />
        </div>
      </div>
    </div>
  );
}
