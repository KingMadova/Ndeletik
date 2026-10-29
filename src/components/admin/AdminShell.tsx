"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Shield } from "lucide-react";
import { clsx } from "clsx";
import { Wordmark } from "@/components/landing/ui";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { buttonClass } from "@/components/ui/Button";
import { isActive } from "@/components/dashboard/nav";
import { useAdmin } from "./AdminProvider";
import { ADMIN_NAV, BACK_ITEM } from "./nav";

/** Même cadre que le dashboard, avec un repère « Admin » : menu latéral (ordinateur), onglets (mobile). */
export function AdminShell({ children }: { children: ReactNode }) {
  const { status, rows } = useAdmin();
  const pathname = usePathname();

  if (status === "loading") return <Skeleton />;
  if (status === "denied") return <Denied />;

  const mobileItems = [...ADMIN_NAV, BACK_ITEM];

  return (
    <div className="min-h-screen bg-bg text-ink">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex items-center gap-2 px-5 pb-4 pt-5">
          <Link href="/admin" aria-label="Ndeletik, administration">
            <Wordmark />
          </Link>
          <Badge tone="brand">
            <Shield size={10} aria-hidden /> Admin
          </Badge>
        </div>

        <nav aria-label="Navigation de l'administration" className="mt-2 flex-1 space-y-1 px-3">
          {ADMIN_NAV.map((item) => {
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
                {item.href === "/admin/users" && <span className="ml-auto text-xs text-muted">{rows.length}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line p-3">
          <Link
            href={BACK_ITEM.href}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-soft hover:text-ink"
          >
            <BACK_ITEM.icon size={18} aria-hidden /> {BACK_ITEM.label}
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-2 lg:hidden">
              <Wordmark />
              <Badge tone="brand">Admin</Badge>
            </div>
            <p className="ml-auto text-sm text-muted">
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:pb-12">{children}</main>
      </div>

      <nav
        aria-label="Navigation de l'administration"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <ul className="mx-auto grid max-w-lg grid-cols-3">
          {mobileItems.map((item) => {
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

function Denied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <Card className="max-w-md text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-fractal-ocre/10 text-fractal-ocre">
          <Shield size={22} aria-hidden />
        </span>
        <h1 className="font-display text-xl font-extrabold">Accès réservé aux administrateurs</h1>
        <p className="mt-2 text-sm text-muted">Ton compte n'a pas les droits pour afficher cette page.</p>
        <Link href="/dashboard" className={buttonClass({ size: "lg", className: "mt-5" })}>
          Retour à mon dashboard
        </Link>
      </Card>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="min-h-screen bg-bg" role="status" aria-label="Chargement de l'administration">
      <div className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-surface p-5 lg:block">
        <div className="h-7 w-32 animate-pulse rounded bg-line/70" />
        <div className="mt-8 space-y-2">
          <div className="h-10 animate-pulse rounded-xl bg-line/50" />
          <div className="h-10 animate-pulse rounded-xl bg-line/50" />
        </div>
      </div>
      <div className="lg:pl-64">
        <div className="h-16 border-b border-line" />
        <div className="mx-auto max-w-6xl space-y-4 px-4 pt-8 sm:px-6">
          <div className="h-9 w-56 animate-pulse rounded bg-line/70" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-line/60" />
            ))}
          </div>
          <div className="h-80 animate-pulse rounded-2xl bg-line/60" />
        </div>
      </div>
    </div>
  );
}
