"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Link from "next/link";
import { Logo } from "./ui";

const plans = {
  Gratuit: {
    m: 0,
    feats: ["5 liens actifs", "4 thèmes de profil", "Statistiques de base", "Page Ndeletik.com/@toi"],
  },
  Pro: {
    m: 3000,
    feats: [
      "Liens illimités",
      "7 thèmes Pro + couleurs personnalisables",
      "Paiement Mobile Money",
      "Statistiques détaillées",
      "Sans badge Ndeletik",
    ],
  },
  Business: {
    m: 9000,
    feats: [
      "Tout le plan Pro",
      "7 thèmes Business (bannières, couvertures)",
      "Domaine personnalisé",
      "Export des données",
      "Support prioritaire",
    ],
  },
} as const;

type Plan = keyof typeof plans;

export function Pricing() {
  const [plan, setPlan] = useState<Plan>("Pro");
  const [yearly, setYearly] = useState(false);
  const p = plans[plan];
  const price = yearly ? Math.round(p.m * 0.8) : p.m;

  return (
    <section id="tarifs" className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto grid max-w-5xl gap-8 rounded-[2rem] bg-gradient-to-br from-fractal-or via-fractal-ocre to-fractal-terra p-5 text-white shadow-soft sm:p-6 md:grid-cols-2 md:p-10">
        <div className="flex flex-col justify-between">
          <div>
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium">Tarifs</span>
            <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">Des prix justes, sans surprise</h2>
            <p className="mt-3 max-w-sm text-sm text-white/85">
              Commence gratuitement. Passe au niveau supérieur quand ton audience grandit. Paiement par Mobile Money.
            </p>
          </div>
          <figure className="mt-8 hidden rounded-2xl bg-white/15 p-4 text-sm md:block">
            <blockquote>« En une semaine, mes clients m'ont payé directement depuis ma page. »</blockquote>
            <figcaption className="mt-2 text-xs text-white/75">Créatrice de contenu, Pointe-Noire</figcaption>
          </figure>
        </div>

        <div className="rounded-3xl bg-surface p-5 text-ink shadow-xl sm:p-6">
          <div className="flex rounded-full bg-soft p-1 text-xs font-medium" role="tablist">
            {(["Mensuel", "Annuel"] as const).map((l) => {
              const active = (l === "Annuel") === yearly;
              return (
                <button
                  key={l}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setYearly(l === "Annuel")}
                  className={`flex-1 rounded-full py-1.5 transition ${active ? "bg-ink text-bg" : "text-muted"}`}
                >
                  {l}
                  {l === "Annuel" && " −20 %"}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex gap-2">
            {(Object.keys(plans) as Plan[]).map((k) => (
              <button
                key={k}
                onClick={() => setPlan(k)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  plan === k ? "border-fractal-ocre bg-fractal-ocre/10 text-fractal-terra" : "border-line text-muted"
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2">
            <Logo className="h-6 w-6" />
            <h3 className="font-display text-lg font-bold">{plan}</h3>
            {plan === "Pro" && (
              <span className="rounded-full bg-fractal-ocre/10 px-2 py-0.5 text-[10px] font-bold text-fractal-terra">
                Populaire
              </span>
            )}
          </div>

          <ul className="mt-4 space-y-2 text-sm">
            {p.feats.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check size={14} className="shrink-0 text-fractal-ocre" /> {f}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-end justify-between border-t border-line pt-5">
            <div>
              <span className="font-display text-3xl font-extrabold sm:text-4xl">
                {new Intl.NumberFormat("fr-FR").format(price)}
              </span>
              <span className="ml-1 text-sm text-muted">FCFA / mois</span>
            </div>
            <Link href="/auth" className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg">
              Choisir {plan}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}