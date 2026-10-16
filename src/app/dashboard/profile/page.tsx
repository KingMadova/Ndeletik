"use client";

import { LogOut, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { LivePreview } from "@/components/dashboard/LivePreview";
import { ProfileAvatar } from "@/components/dashboard/ProfileAvatar";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { PLAN_LABEL } from "@/lib/dashboard-types";

export default function ProfilePage() {
  const d = useDashboard();

  return (
    <>
      <PageHeader title="Profil" description="La photo, la bannière et les informations affichées en haut de ta page." />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <ProfileForm key={d.profileId} />

          <Card>
            <CardTitle hint={`${d.profiles.length} sur ${d.profileLimit} profils avec ton plan.`}>Mes profils</CardTitle>
            <ul className="divide-y divide-line">
              {d.profiles.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3 first:pt-0">
                  <ProfileAvatar profile={p} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{p.display_name}</p>
                    <p className="truncate text-xs text-muted">@{p.slug}</p>
                  </div>
                  {p.id === d.profileId ? (
                    <Badge tone="brand">En cours</Badge>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => d.selectProfile(p.id)}>
                      Modifier
                    </Button>
                  )}
                </li>
              ))}
            </ul>
            <Button variant="secondary" full className="mt-4" onClick={d.createNewProfile}>
              <Plus size={16} aria-hidden /> Nouveau profil
            </Button>
          </Card>

          <Card className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink">Mon plan</span>
              <Badge tone="brand">{PLAN_LABEL[d.plan]}</Badge>
            </div>
            <Button variant="ghost" onClick={d.logout}>
              <LogOut size={16} aria-hidden /> Déconnexion
            </Button>
          </Card>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <LivePreview />
          </div>
        </aside>
      </div>
    </>
  );
}
