import Link from "next/link";
import { BtnDark, GradText, Mark, Wordmark } from "./ui";

export function FinalCta() {
  return (
    <section className="px-6 py-24 text-center">
      <h2 className="mx-auto max-w-3xl font-display text-4xl font-extrabold leading-tight md:text-6xl">
        Libère la puissance de <Mark /> <GradText>Ndeletik</GradText>
      </h2>
      <p className="mx-auto mt-4 max-w-md text-sm text-muted">Crée ta page gratuite maintenant et partage-la partout.</p>
      <BtnDark href="/auth" className="mt-7 px-7 py-3.5 text-base">
        Créer ma page gratuite
      </BtnDark>
    </section>
  );
}

const cols = [
  { t: "Produit", l: [["Fonctionnalités", "#fonctionnalites"], ["Tarifs", "#tarifs"], ["Calculateur", "#calculateur"]] },
  { t: "Ressources", l: [["FAQ", "#faq"], ["Exemple de page", "/demo"], ["Contact", "/contact"]] },
  { t: "Légal", l: [["Confidentialité", "/confidentialite"], ["Conditions", "/conditions"]] },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-surface px-6 pt-14">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Wordmark />
          <p className="mt-3 max-w-xs text-sm text-muted">
            Mindset. Strategy. Growth. <br />
            La page de liens des créateurs africains.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.t}>
            <h3 className="mb-3 text-sm font-bold">{c.t}</h3>
            <ul className="space-y-2 text-sm text-muted">
              {c.l.map(([n, h]) => (
                <li key={n}>
                  <Link href={h} className="hover:text-ink">
                    {n}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-10 max-w-5xl text-xs text-muted">© {new Date().getFullYear()} Ndeletik. Tous droits réservés.</p>
      <div
        aria-hidden
        className="pointer-events-none select-none text-center font-display text-[22vw] font-extrabold leading-[0.8] tracking-tighter text-transparent bg-gradient-to-b from-fractal-ocre/25 to-transparent bg-clip-text"
      >
        Ndeletik
      </div>
    </footer>
  );
}