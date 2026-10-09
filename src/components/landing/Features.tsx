import { GripVertical } from "lucide-react";
import { FaWhatsapp, FaYoutube } from "react-icons/fa6";
import { SiShopify } from "react-icons/si";
import { Card, GradText, Mark, SectionTitle, grad } from "./ui";

/* Carte 1 : vrais logos d'apps dans la liste de liens */
function LinksCard() {
  const rows = [
    { Icon: SiShopify, bg: "bg-[#95BF47]", t: "Ma boutique Forever", c: 128 },
    { Icon: FaWhatsapp, bg: "bg-[#25D366]", t: "Commandes WhatsApp", c: 96 },
    { Icon: FaYoutube, bg: "bg-[#FF0000]", t: "Ma chaîne YouTube", c: 54 },
  ];
  return (
    <Card className="p-5">
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.t} className="flex items-center gap-3 rounded-2xl border border-line bg-bg p-3">
            <GripVertical size={14} className="shrink-0 text-muted" />
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${r.bg} text-white`}>
              <r.Icon size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold">{r.t}</div>
              <div className="text-[10px] text-muted">{r.c} clics</div>
            </div>
            <span className="h-4 w-7 rounded-full bg-fractal-ocre/80" aria-hidden />
          </div>
        ))}
      </div>
      <h3 className="mt-5 text-sm font-bold">Crée et organise tes liens</h3>
      <p className="mt-1 text-xs text-muted">Ajoute, classe et active tes liens en glissant-déposant.</p>
    </Card>
  );
}

/* Carte 2 : mini-profil fictif avec vraie photo + boutons à vraies icônes */
function DesignCard() {
  return (
    <Card className="p-5">
      <div className="rounded-2xl bg-soft p-4">
        <div className="mx-auto flex w-44 flex-col items-center rounded-2xl bg-surface p-3 shadow-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=80"
            alt="Créatrice fictive"
            className="h-12 w-12 rounded-full object-cover ring-2 ring-fractal-ocre/40"
          />
          <div className="mt-2 text-[11px] font-bold">@coach.alvine</div>
          <div className="mt-1.5 flex w-full flex-col gap-1.5">
            <span className="flex items-center justify-center gap-1.5 rounded-full bg-ink py-1 text-[10px] text-bg">
              <SiShopify size={10} /> Boutique
            </span>
            <span className="flex items-center justify-center gap-1.5 rounded-full border border-line py-1 text-[10px] text-ink">
              <FaWhatsapp size={10} className="text-[#25D366]" /> WhatsApp
            </span>
          </div>
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

/* Carte 3 : graphique de stats */
function StatsCard() {
  return (
    <Card className="p-5">
      <div className="rounded-2xl bg-bg p-4">
        <div className="text-[10px] text-muted">Clics cette semaine</div>
        <div className="font-display text-xl font-bold">1 284</div>
        <svg viewBox="0 0 200 80" className="mt-2 w-full" aria-hidden>
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
    <section id="fonctionnalites" className="px-4 py-16 sm:px-6 sm:py-20">
      <SectionTitle label="Fonctionnalités">
        Transforme ta bio en <br className="hidden md:block" />
        <Mark /> <GradText>boutique</GradText>
      </SectionTitle>
      <p className="-mt-6 mb-10 px-2 text-center text-sm text-muted">
        Tout pour créer et faire grandir ta page, au même endroit.
      </p>
      <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
        <LinksCard />
        <DesignCard />
        <StatsCard />
      </div>
    </section>
  );
}