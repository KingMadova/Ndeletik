"use client";

import { useState } from "react";
import { GradText, Mark, SectionTitle, Card } from "./ui";

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n));

function Slider({
  label, value, min, max, step, suffix, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <div className="mb-2 flex justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="font-semibold text-fractal-terra">{fmt(value)} {suffix}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full accent-[#FF6A1A]"
        style={{ background: `linear-gradient(90deg,#F9A825,#FF6A1A ${pct}%,rgb(var(--line)) ${pct}%)` }}
      />
    </label>
  );
}

export function Calculator() {
  const [visits, setVisits] = useState(5000);
  const [ctr, setCtr] = useState(18);
  const [conv, setConv] = useState(4);
  const [basket, setBasket] = useState(15000);
  // Objectif plus élevé que le revenu par défaut (540 000) : la jauge ne démarre plus pleine.
  const [goal, setGoal] = useState(1500000);

  const withN = visits * (ctr / 100) * (conv / 100) * basket;
  const without = withN * 0.6; // hypothèse : page classique = 40 % de clics en moins
  const gain = withN - without;

  // Progression réelle (peut dépasser 100 %) ; l'anneau, lui, plafonne à un tour complet.
  const ratio = goal > 0 ? withN / goal : 0;
  const pct = Math.round(ratio * 100);
  const share = Math.min(ratio, 1);
  const reached = ratio >= 1;

  const R = 52;
  const C = 2 * Math.PI * R;

  return (
    <section id="calculateur" className="px-6 py-20">
      <SectionTitle label="Calculateur">
        Combien Ndeletik peut <br className="hidden md:block" /> transformer <Mark /> <GradText>ton activité</GradText>
      </SectionTitle>

      <Card className="mx-auto grid max-w-4xl gap-8 p-6 md:grid-cols-2 md:p-8">
        <div className="space-y-6">
          <Slider label="Visiteurs par mois" value={visits} min={500} max={100000} step={500} suffix="" onChange={setVisits} />
          <Slider label="Taux de clic" value={ctr} min={1} max={40} step={1} suffix="%" onChange={setCtr} />
          <Slider label="Taux d'achat" value={conv} min={1} max={20} step={1} suffix="%" onChange={setConv} />
          <Slider label="Panier moyen" value={basket} min={1000} max={100000} step={500} suffix="FCFA" onChange={setBasket} />
          <Slider label="Objectif mensuel" value={goal} min={50000} max={5000000} step={50000} suffix="FCFA" onChange={setGoal} />
        </div>

        <div className="rounded-2xl bg-soft p-5">
          <div className="flex items-center gap-5">
            <div className="relative h-28 w-28 shrink-0">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" role="img" aria-label={`${pct} % de l'objectif`}>
                <defs>
                  <linearGradient id="donut" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#F9A825" />
                    <stop offset="1" stopColor="#C1440E" />
                  </linearGradient>
                </defs>
                {/* Piste : classe Tailwind (var() dans un attribut SVG n'est pas fiable) */}
                <circle cx="60" cy="60" r={R} fill="none" strokeWidth="14" className="stroke-line" />
                <circle
                  cx="60" cy="60" r={R} fill="none" stroke="url(#donut)" strokeWidth="14"
                  strokeLinecap={share > 0.02 ? "round" : "butt"}
                  strokeDasharray={`${C * share} ${C}`}
                  className="transition-[stroke-dasharray] duration-500 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-xl font-extrabold text-fractal-terra">{pct}%</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-muted">Revenu mensuel avec Ndeletik</div>
              <div className="font-display text-2xl font-extrabold">{fmt(withN)} <span className="text-sm">FCFA</span></div>
              <div className="mt-1 text-[11px] text-muted">
                {reached ? "Objectif de " : "soit "}{reached ? `${fmt(goal)} FCFA atteint` : `${pct} % de ton objectif de ${fmt(goal)} FCFA`}
              </div>
            </div>
          </div>

          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Avec une page classique</dt><dd className="font-semibold">{fmt(without)} FCFA</dd></div>
            <div className="flex justify-between border-t border-line pt-2"><dt className="font-medium">Gain estimé</dt><dd className="font-bold text-fractal-terra">+{fmt(gain)} FCFA</dd></div>
          </dl>
          <p className="mt-3 text-[11px] text-muted">Estimation indicative : une page classique génère environ 40 % de clics en moins.</p>
        </div>
      </Card>
    </section>
  );
}