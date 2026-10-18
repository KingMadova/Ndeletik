"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, Crown, ExternalLink, Eye, Link2, MousePointerClick, Trash2, Users } from "lucide-react";
import { Button, buttonClass } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, inputClass } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { ProfileAvatar } from "@/components/dashboard/ProfileAvatar";
import { useToast } from "@/components/dashboard/Toast";
import { useAdmin } from "@/components/admin/AdminProvider";
import { PlanDot, RoleBadge } from "@/components/admin/bits";
import { fmt, fmtDate } from "@/lib/admin-types";
import { supabase } from "@/lib/supabaseClient";

type LinkRow = { id: string; title: string; url: string; clicks: number; enabled: boolean };

export default function AdminUserPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { rows, meId, toggleRole, deleteUser } = useAdmin();
  const row = rows.find((r) => r.id === id);

  const [links, setLinks] = useState<LinkRow[] | null>(null);
  const [roleModal, setRoleModal] = useState(false);
  const [delModal, setDelModal] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLinks(null);
    supabase
      .from("links")
      .select("id, title, url, clicks, enabled")
      .eq("profile_id", id)
      .order("position", { ascending: true })
      .then(({ data }) => {
        if (alive) setLinks((data ?? []) as LinkRow[]);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  if (!row) {
    return (
      <EmptyState
        icon={<Users size={22} aria-hidden />}
        title="Utilisateur introuvable"
        description="Ce profil n'existe plus ou a été supprimé."
        action={
          <Link href="/admin/users" className={buttonClass({ variant: "secondary" })}>
            <ArrowLeft size={16} aria-hidden /> Retour aux utilisateurs
          </Link>
        }
      />
    );
  }

  const isMe = row.user_id === meId;
  const isAdmin = row.role === "admin";
  const siblings = rows.filter((r) => r.user_id === row.user_id && r.id !== row.id);
  const lastProfile = siblings.length === 0;

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(row.user_id);
      toast("Identifiant copié");
    } catch {
      toast("Copie impossible", false);
    }
  };

  const confirmRole = async () => {
    setBusy(true);
    const ok = await toggleRole(row);
    setBusy(false);
    if (ok) setRoleModal(false);
  };

  const confirmDelete = async () => {
    setBusy(true);
    const ok = await deleteUser(row);
    setBusy(false);
    if (ok) router.replace("/admin/users");
  };

  return (
    <>
      <Link href="/admin/users" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fractal-terra">
        <ArrowLeft size={15} aria-hidden /> Utilisateurs
      </Link>

      <Card className="mb-6 flex flex-wrap items-center gap-4">
        <ProfileAvatar profile={row} size={64} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-2xl font-extrabold tracking-tight">@{row.slug}</h1>
          <p className="truncate text-sm text-muted">{row.display_name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <PlanDot plan={row.plan} />
            <RoleBadge role={row.role} />
            {isMe && <span className="text-xs font-medium text-fractal-terra">C'est toi</span>}
          </div>
        </div>
        <a href={`/@${row.slug}`} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "secondary" })}>
          <ExternalLink size={16} aria-hidden /> Voir sa page
        </a>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat icon={<Link2 size={18} aria-hidden />} label="Liens" value={fmt(row.links_count)} />
        <Stat icon={<MousePointerClick size={18} aria-hidden />} label="Clics" value={fmt(row.clicks_total)} />
        <Stat icon={<Eye size={18} aria-hidden />} label="Vues de la page" value={fmt(row.views)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <Card padded={false}>
            <div className="px-5 pb-2 pt-5">
              <CardTitle hint="Les liens publiés et masqués de ce profil.">Liens du profil</CardTitle>
            </div>
            {links === null ? (
              <div className="space-y-2 px-5 pb-5">
                <div className="h-10 animate-pulse rounded-xl bg-line/50" />
                <div className="h-10 animate-pulse rounded-xl bg-line/50" />
              </div>
            ) : links.length === 0 ? (
              <p className="px-5 pb-6 text-sm text-muted">Aucun lien pour le moment.</p>
            ) : (
              <ul className="divide-y divide-line">
                {links.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 px-5 py-3">
                    <div className={`min-w-0 flex-1 ${l.enabled ? "" : "opacity-55"}`}>
                      <p className="truncate text-sm font-semibold">{l.title}</p>
                      <p className="truncate text-xs text-muted">
                        {l.enabled ? "" : "Masqué · "}
                        {l.url.replace(/^https?:\/\//, "")}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-soft px-2.5 py-1 text-xs text-muted">
                      {fmt(l.clicks)} clic{l.clicks > 1 ? "s" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {siblings.length > 0 && (
            <Card padded={false}>
              <div className="px-5 pb-2 pt-5">
                <CardTitle hint="Autres profils rattachés au même compte.">Autres profils du compte</CardTitle>
              </div>
              <ul className="divide-y divide-line">
                {siblings.map((s) => (
                  <li key={s.id}>
                    <Link href={`/admin/users/${s.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-soft/60">
                      <ProfileAvatar profile={s} size={32} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">@{s.slug}</span>
                        <span className="block truncate text-xs text-muted">{s.display_name}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle>Détails</CardTitle>
            <dl className="space-y-3 text-sm">
              <Detail label="Pays" value={row.country ?? "—"} />
              <Detail label="Thème" value={row.theme_id} />
              <Detail label="Inscrit le" value={fmtDate(row.created_at)} />
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Identifiant</dt>
                <dd className="flex min-w-0 items-center gap-1.5">
                  <code className="truncate text-xs">{row.user_id.slice(0, 8)}…</code>
                  <button type="button" onClick={copyId} aria-label="Copier l'identifiant du compte" className="rounded-full p-1.5 text-muted hover:bg-soft hover:text-fractal-terra">
                    <Copy size={13} aria-hidden />
                  </button>
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardTitle hint={isAdmin ? "Peut accéder à cette administration." : "Accès standard à son espace."}>Rôle</CardTitle>
            <Button variant="secondary" full disabled={isMe} onClick={() => setRoleModal(true)}>
              <Crown size={16} aria-hidden /> {isAdmin ? "Retirer le rôle administrateur" : "Promouvoir administrateur"}
            </Button>
            {isMe && <p className="mt-2 text-xs text-muted">Tu ne peux pas modifier ton propre rôle.</p>}
          </Card>

          <Card className="border-red-200">
            <CardTitle hint="Action irréversible.">Zone sensible</CardTitle>
            <Button
              variant="danger"
              full
              disabled={isMe}
              className="border border-red-200"
              onClick={() => {
                setTyped("");
                setDelModal(true);
              }}
            >
              <Trash2 size={16} aria-hidden /> Supprimer ce profil
            </Button>
            {isMe && <p className="mt-2 text-xs text-muted">Tu ne peux pas supprimer ton propre compte ici.</p>}
          </Card>
        </div>
      </div>

      <Modal
        open={roleModal}
        onClose={() => setRoleModal(false)}
        title={isAdmin ? "Retirer le rôle administrateur ?" : "Promouvoir administrateur ?"}
        description={
          isAdmin
            ? `@${row.slug} n'aura plus accès à l'administration.`
            : `@${row.slug} pourra voir tous les utilisateurs, modifier les rôles et supprimer des comptes.`
        }
        size="sm"
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setRoleModal(false)}>
            Annuler
          </Button>
          <Button onClick={confirmRole} disabled={busy} data-autofocus>
            {busy ? "En cours…" : "Confirmer"}
          </Button>
        </div>
      </Modal>

      <Modal
        open={delModal}
        onClose={() => setDelModal(false)}
        title="Supprimer ce profil ?"
        description={
          lastProfile
            ? `@${row.slug}, ses liens et son compte seront supprimés définitivement.`
            : `@${row.slug} et ses liens seront supprimés. Le compte reste actif : il a ${siblings.length} autre${siblings.length > 1 ? "s" : ""} profil${siblings.length > 1 ? "s" : ""}.`
        }
      >
        <div className="grid gap-4">
          <Field label={`Pour confirmer, tape « ${row.slug} »`}>
            <input value={typed} onChange={(e) => setTyped(e.target.value)} className={inputClass} autoCapitalize="none" autoCorrect="off" data-autofocus />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDelModal(false)}>
              Annuler
            </Button>
            <Button className="!bg-red-600 hover:!bg-red-700" disabled={typed.trim() !== row.slug || busy} onClick={confirmDelete}>
              <Trash2 size={16} aria-hidden /> {busy ? "Suppression…" : "Supprimer définitivement"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="flex items-center gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-fractal-ocre/10 text-fractal-ocre">{icon}</span>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="font-display text-2xl font-extrabold">{value}</p>
      </div>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  );
}
