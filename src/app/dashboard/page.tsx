"use client";

import { useState } from "react";
import Link from "next/link";
import { Reorder } from "framer-motion";
import { Eye, Link2, Plus, Sparkles } from "lucide-react";
import { Button, buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { AddBlockModal, type BlockPreset } from "@/components/dashboard/AddBlockModal";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { LinkAnalyticsModal } from "@/components/dashboard/LinkAnalyticsModal";
import { LinkItem } from "@/components/dashboard/LinkItem";
import { LinkTemplates } from "@/components/dashboard/LinkTemplates";
import { LivePreview } from "@/components/dashboard/LivePreview";
import { ShortLinkManager } from "@/components/dashboard/ShortLinkManager";
import type { DbLink } from "@/lib/dashboard-types";

export default function LinksPage() {
  const d = useDashboard();
  const [adding, setAdding] = useState<{ open: boolean; preset?: BlockPreset }>({ open: false });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [analyticsLink, setAnalyticsLink] = useState<DbLink | null>(null);

  const limited = d.maxLinks !== null;
  const atLimit = limited && d.activeLinks >= (d.maxLinks as number);

  return (
    <>
      <PageHeader
        title="Mes liens"
        description="Ajoute, réorganise par glisser-déposer et publie les liens de ta page."
        actions={
          <>
            <Button variant="secondary" onClick={() => setPreviewOpen(true)} className="lg:hidden">
              <Eye size={16} aria-hidden /> Aperçu
            </Button>
            <Button onClick={() => setAdding({ open: true })}>
              <Plus size={16} aria-hidden /> Ajouter un lien
            </Button>
          </>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-8">
          {limited && (
            <Card className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="min-w-[10rem] flex-1">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-ink">Liens actifs</span>
                  <span className={atLimit ? "font-semibold text-fractal-terra" : "text-muted"}>
                    {d.activeLinks} / {d.maxLinks}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-line/60" role="progressbar" aria-valuenow={d.activeLinks} aria-valuemin={0} aria-valuemax={d.maxLinks as number} aria-label="Liens actifs sur la limite du plan">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-fractal-or to-fractal-terra transition-all"
                    style={{ width: `${Math.min(100, (d.activeLinks / (d.maxLinks as number)) * 100)}%` }}
                  />
                </div>
              </div>
              <Link href="/#tarifs" className={buttonClass({ variant: atLimit ? "primary" : "secondary", size: "sm" })}>
                <Sparkles size={14} aria-hidden /> {atLimit ? "Débloquer plus de liens" : "Passer au Pro"}
              </Link>
            </Card>
          )}

          <LinkTemplates onPick={(t) => setAdding({ open: true, preset: { title: t.title, url: t.url, icon: t.icon } })} />

          <section aria-labelledby="links-list">
            <h2 id="links-list" className="mb-3 font-display text-sm font-bold text-ink">
              Mes liens ({d.links.length})
            </h2>
            {d.links.length === 0 ? (
              <EmptyState
                icon={<Link2 size={22} aria-hidden />}
                title="Aucun lien pour le moment"
                description="Choisis un modèle ci-dessus ou ajoute ton premier lien. Il apparaîtra tout de suite dans l'aperçu."
                action={
                  <Button onClick={() => setAdding({ open: true })}>
                    <Plus size={16} aria-hidden /> Ajouter mon premier lien
                  </Button>
                }
              />
            ) : (
              <Reorder.Group axis="y" values={d.links} onReorder={d.setLinks} className="m-0 space-y-2.5 p-0">
                {d.links.map((l) => (
                  <LinkItem
                    key={l.id}
                    link={l}
                    onUpdate={d.updateLink}
                    onDelete={d.deleteLink}
                    onDragEnd={d.persistOrder}
                    onShowAnalytics={setAnalyticsLink}
                  />
                ))}
              </Reorder.Group>
            )}
          </section>

          {d.userId && <ShortLinkManager userId={d.userId} plan={d.plan} />}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <LivePreview />
          </div>
        </aside>
      </div>

      <AddBlockModal
        open={adding.open}
        initial={adding.preset}
        onClose={() => setAdding({ open: false })}
        onAdd={d.addLink}
      />

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Aperçu de ma page" size="sm">
        <LivePreview framed={false} />
      </Modal>

      {d.profileId && (
        <LinkAnalyticsModal
          open={!!analyticsLink}
          onClose={() => setAnalyticsLink(null)}
          link={analyticsLink}
          profile={{ id: d.profileId }}
        />
      )}
    </>
  );
}
