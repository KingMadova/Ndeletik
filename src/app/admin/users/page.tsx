"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Download, FilterX, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { inputClass } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProfileAvatar } from "@/components/dashboard/ProfileAvatar";
import { useAdmin } from "@/components/admin/AdminProvider";
import { PlanDot, RoleBadge } from "@/components/admin/bits";
import { PLAN_LABELS, PLAN_ORDER, SORTS, fmt, fmtDate, type SortKey } from "@/lib/admin-types";

const PAGE = 50;

export default function AdminUsersPage() {
  const { rows, exportCsv } = useAdmin();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("all");
  const [plan, setPlan] = useState("all");
  const [role, setRole] = useState("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [limit, setLimit] = useState(PAGE);

  const countryOptions = useMemo(() => {
    const m = new Map<string, number>();
    rows.forEach((r) => {
      const c = r.country?.trim();
      if (c) m.set(c, (m.get(c) ?? 0) + 1);
    });
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], "fr"));
  }, [rows]);

  const filtered = useMemo(() => {
    const nq = q.trim().toLowerCase();
    const list = rows.filter((r) => {
      if (nq && !(r.slug.toLowerCase().includes(nq) || r.display_name.toLowerCase().includes(nq))) return false;
      if (country !== "all" && (r.country?.trim() ?? "—") !== country) return false;
      if (plan !== "all" && r.plan !== plan) return false;
      if (role !== "all" && r.role !== role) return false;
      return true;
    });
    const by: Record<SortKey, (a: (typeof rows)[number], b: (typeof rows)[number]) => number> = {
      recent: (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
      old: (a, b) => +new Date(a.created_at) - +new Date(b.created_at),
      clicks: (a, b) => b.clicks_total - a.clicks_total,
      views: (a, b) => b.views - a.views,
      links: (a, b) => b.links_count - a.links_count,
      az: (a, b) => a.slug.localeCompare(b.slug, "fr"),
    };
    return [...list].sort(by[sort]);
  }, [rows, q, country, plan, role, sort]);

  const hasFilters = q !== "" || country !== "all" || plan !== "all" || role !== "all";
  const reset = () => {
    setQ("");
    setCountry("all");
    setPlan("all");
    setRole("all");
    setLimit(PAGE);
  };
  const shown = filtered.slice(0, limit);
  const accounts = new Set(rows.map((r) => r.user_id)).size;

  return (
    <>
      <PageHeader
        title="Utilisateurs"
        description={`${fmt(rows.length)} profil${rows.length > 1 ? "s" : ""} · ${fmt(accounts)} compte${accounts > 1 ? "s" : ""}`}
        actions={
          <Button onClick={() => exportCsv(filtered)} disabled={filtered.length === 0}>
            <Download size={16} aria-hidden /> Export CSV
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          <label className="relative col-span-2">
            <span className="sr-only">Rechercher</span>
            <Search size={15} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setLimit(PAGE);
              }}
              placeholder="Pseudo ou nom…"
              className={`${inputClass} pl-9`}
            />
          </label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} aria-label="Filtrer par pays">
            <option value="all">Tous les pays</option>
            {countryOptions.map(([c, n]) => (
              <option key={c} value={c}>
                {c} ({n})
              </option>
            ))}
          </select>
          <select value={plan} onChange={(e) => setPlan(e.target.value)} className={inputClass} aria-label="Filtrer par plan">
            <option value="all">Tous les plans</option>
            {PLAN_ORDER.map((p) => (
              <option key={p} value={p}>
                {PLAN_LABELS[p]}
              </option>
            ))}
          </select>
          <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass} aria-label="Filtrer par rôle">
            <option value="all">Tous les rôles</option>
            <option value="admin">Admins</option>
            <option value="user">Utilisateurs</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={inputClass} aria-label="Trier">
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted">
          <span>
            {fmt(filtered.length)} affiché{filtered.length > 1 ? "s" : ""} sur {fmt(rows.length)}
          </span>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <FilterX size={13} aria-hidden /> Réinitialiser
            </Button>
          )}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={22} aria-hidden />}
          title="Aucun utilisateur ne correspond"
          description="Modifie ta recherche ou tes filtres."
          action={hasFilters ? <Button variant="secondary" onClick={reset}>Réinitialiser les filtres</Button> : undefined}
        />
      ) : (
        <>
          {/* Mobile : cartes */}
          <ul className="space-y-2.5 md:hidden">
            {shown.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/admin/users/${r.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-soft transition-colors hover:border-fractal-ocre/60"
                >
                  <ProfileAvatar profile={r} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">@{r.slug}</p>
                    <p className="truncate text-xs text-muted">
                      {r.display_name}
                      {r.country ? ` · ${r.country}` : ""}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <PlanDot plan={r.plan} />
                      {r.role === "admin" && <RoleBadge role={r.role} />}
                      <span className="text-[11px] text-muted">
                        {r.links_count} lien{r.links_count > 1 ? "s" : ""} · {fmt(r.clicks_total)} clic{r.clicks_total > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>

          {/* Ordinateur : tableau */}
          <Card padded={false} className="hidden overflow-hidden md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th className="px-5 py-3 font-medium">Utilisateur</th>
                  <th className="px-3 py-3 font-medium">Pays</th>
                  <th className="px-3 py-3 text-center font-medium">Liens</th>
                  <th className="px-3 py-3 text-center font-medium">Clics</th>
                  <th className="px-3 py-3 font-medium">Plan</th>
                  <th className="px-3 py-3 font-medium">Rôle</th>
                  <th className="px-3 py-3 font-medium">Inscrit le</th>
                  <th className="w-10 px-3 py-3" aria-label="Ouvrir" />
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => router.push(`/admin/users/${r.id}`)}
                    className="cursor-pointer border-b border-line/60 transition-colors last:border-0 hover:bg-soft/60"
                  >
                    <td className="px-5 py-3">
                      <Link href={`/admin/users/${r.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-3">
                        <ProfileAvatar profile={r} size={34} />
                        <span className="min-w-0">
                          <span className="block truncate font-medium">@{r.slug}</span>
                          <span className="block truncate text-xs text-muted">{r.display_name}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-muted">{r.country ?? "—"}</td>
                    <td className="px-3 py-3 text-center">{r.links_count}</td>
                    <td className="px-3 py-3 text-center">{fmt(r.clicks_total)}</td>
                    <td className="px-3 py-3">
                      <PlanDot plan={r.plan} />
                    </td>
                    <td className="px-3 py-3">
                      <RoleBadge role={r.role} />
                    </td>
                    <td className="px-3 py-3 text-xs text-muted">{fmtDate(r.created_at)}</td>
                    <td className="px-3 py-3 text-muted">
                      <ChevronRight size={16} aria-hidden />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {filtered.length > shown.length && (
            <div className="mt-4 flex justify-center">
              <Button variant="secondary" onClick={() => setLimit((l) => l + PAGE)}>
                Afficher {Math.min(PAGE, filtered.length - shown.length)} de plus
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
