"use client";
import { useState } from "react";
import { Card, GradText, Mark, SectionTitle } from "./ui";

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n));

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <div className="mb-2 flex justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="font-semibold text-fractal-terra">
          {fmt(value)} {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full accent-[#FF6A1A]"
        style={{ background: `linear-gradient(90deg,#F9A825,#FF6A1A ${pct}%,var(--color-line) ${pct}%)` }}
      />
    </label>
  );
}

export function Calculator() {
  const [visits, setVisits] = useState(5000);
  const [ctr, setCtr] = useState(18);
  const [conv, setConv] = useState(4);
  const [basket, setBasket] = useState(15000);
  const [goal, setGoal] = useState(500000);

  const withN = visits * (ctr / 100) * (conv / 100) * basket;
  const without = withN * 0.6;
  const gain = withN - without;
  const share = goal > 0 ? Math.min(withN / goal, 1) : 0;
  const pct = Math.round(share * 100);

  const R = 52;
  const C = 2 * Math.PI * R;

  return (
    <section id="calculateur" className="px-4 py-16 sm:px-6 sm:py-20">
      <SectionTitle label="Calculateur">
        Combien Ndeletik peut <br className="hidden md:block" /> transformer <Mark />{" "}
        <GradText>ton activité</GradText>
      </SectionTitle>

      <Card className="mx-auto grid max-w-4xl gap-8 p-5 sm:p-6 md:grid-cols-2 md:p-8">
        <div className="space-y-5 sm:space-y-6">
          <Slider label="Visiteurs par mois" value={visits} min={500} max={100000} step={500} suffix="" onChange={setVisits} />
          <Slider label="Taux de clic" value={ctr} min={1} max={40} step={1} suffix="%" onChange={setCtr} />
          <Slider label="Taux d'achat" value={conv} min={1} max={20} step={1} suffix="%" onChange={setConv} />
          <Slider label="Panier moyen" value={basket} min={1000} max={100000} step={500} suffix="FCFA" onChange={setBasket} />
          <Slider label="Objectif mensuel" value={goal} min={50000} max={5000000} step={50000} suffix="FCFA" onChange={setGoal} />
        </div>

        <div className="rounded-2xl bg-soft p-5">
          {/* Donut + texte : empilés sur très petits écrans */}
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            <div className="relative h-28 w-28 shrink-0">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" role="img" aria-label={`${pct} % de l'objectif atteint`}>
                <defs>
                  <linearGradient id="donut" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#F9A825" />
                    <stop offset="1" stopColor="#C1440E" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r={R} fill="none" stroke="var(--color-line)" strokeWidth="14" />
                <circle
                  cx="60"
                  cy="60"
                  r={R}
                  fill="none"
                  stroke="url(#donut)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${C * share} ${C}`}
                  className="transition-[stroke-dasharray] duration-500 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-xl font-extrabold text-fractal-terra">{pct}%</span>
              </div>
            </div>

            <div className="text-center sm:text-left">
              <div className="text-xs text-muted">Revenu mensuel avec Ndeletik</div>
              <div className="font-display text-2xl font-extrabold">
                {fmt(withN)} <span className="text-sm">FCFA</span>
              </div>
              <div className="mt-1 text-[11px] text-muted">
                soit {pct} % de ton objectif de {fmt(goal)} FCFA
              </div>
            </div>
          </div>

          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Avec une page classique</dt>
              <dd className="font-semibold">{fmt(without)} FCFA</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2">
              <dt className="font-medium">Gain estimé</dt>
              <dd className="font-bold text-fractal-terra">+{fmt(gain)} FCFA</dd>
            </div>
          </dl>
          <p className="mt-3 text-[11px] text-muted">
            Estimation indicative : une page classique génère environ 40 % de clics en moins.
          </p>
        </div>
      </Card>
    </section>
  );
}