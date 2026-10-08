import { GripVertical } from "lucide-react";
import { Card, GradText, Mark, SectionTitle, grad } from "./ui";

function LinksCard() {
  const rows = ["Ma boutique Forever", "Rejoindre le webinaire", "Ma chaîne YouTube"];
  return (
    <Card className="p-5">
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={r} className="flex items-center gap-3 rounded-2xl border border-line bg-bg p-3">
            <GripVertical size={14} className="text-muted" />
            <div className={`h-8 w-8 rounded-lg ${grad}`} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold">{r}</div>
              <div className="text-[10px] text-muted">{[128, 96, 54][i]} clics</div>
            </div>
            <span className="h-4 w-7 rounded-full bg-fractal-ocre/80" />
          </div>
        ))}
      </div>
      <h3 className="mt-5 text-sm font-bold">Crée et organise tes liens</h3>
      <p className="mt-1 text-xs text-muted">Ajoute, classe et active tes liens en glissant-déposant.</p>
    </Card>
  );
}

function DesignCard() {
  return (
    <Card className="p-5">
      <div className="rounded-2xl bg-soft p-4">
        <div className="mx-auto flex w-40 flex-col items-center rounded-2xl bg-surface p-3 shadow-soft">
          <div className={`h-10 w-10 rounded-full ${grad}`} />
          <div className="mt-2 text-[11px] font-bold">@coach.alvine</div>
          {["Boutique", "Webinaire"].map((l) => (
            <div key={l} className="mt-1.5 w-full rounded-full bg-ink py-1 text-center text-[10px] text-bg">
              {l}
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-center gap-2">
          {["#F9A825", "#FF6A1A", "#C1440E", "#18181B"].map((c) => (
            <span key={c} className="h-5 w-5 rounded-full ring-2 ring-surface" style={{ background: c }} />
          ))}
        </div>
      </div>
      <h3 className="mt-5 text-sm font-bold">Personnalise ton profil</h3>
      <p className="mt-1 text-xs text-muted">Couleurs, boutons, polices : ta page te ressemble.</p>
    </Card>
  );
}

function StatsCard() {
  return (
    <Card className="p-5">
      <div className="rounded-2xl bg-bg p-4">
        <div className="text-[10px] text-muted">Clics cette semaine</div>
        <div className="font-display text-xl font-bold">1 284</div>
        <svg viewBox="0 0 200 80" className="mt-2 w-full">
          <defs>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FF6A1A" stopOpacity=".35" />
              <stop offset="1" stopColor="#FF6A1A" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 62 C25 58 35 30 60 36 S100 58 125 30 S170 16 200 8 L200 80 L0 80Z" fill="url(#area)" />
          <path d="M0 62 C25 58 35 30 60 36 S100 58 125 30 S170 16 200 8" fill="none" stroke="#FF6A1A" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M0 70 C40 64 80 66 120 54 S170 40 200 34" fill="none" stroke="#C1440E" strokeWidth="1.5" strokeDasharray="3 4" opacity=".6" />
        </svg>
      </div>
      <h3 className="mt-5 text-sm font-bold">Analyse tes clics et revenus</h3>
      <p className="mt-1 text-xs text-muted">Vois ce qui marche, par lien et par jour.</p>
    </Card>
  );
}

export function Features() {
  return (
    <section id="fonctionnalites" className="px-6 py-20">
      <SectionTitle label="Fonctionnalités">
        Transforme ta bio en <br className="hidden md:block" />
        <Mark /> <GradText>boutique</GradText>
      </SectionTitle>
      <p className="-mt-6 mb-10 text-center text-sm text-muted">Tout pour créer et faire grandir ta page, au même endroit.</p>
      <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
        <LinksCard />
        <DesignCard />
        <StatsCard />
      </div>
    </section>
  );
}