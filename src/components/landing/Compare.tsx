import { Check, Minus } from "lucide-react";
import { BtnDark, GradText, Mark, SectionTitle, grad } from "./ui";

const rows = [
  "Paiement Mobile Money",
  "Design de profil personnalisable",
  "Statistiques par lien",
  "Page rapide sur connexion limitée",
  "Support en français",
  "Domaine personnalisé",
];
const others = [false, true, true, false, false, true];

export function Compare() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
        {/* Colonne texte */}
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight md:text-5xl">
            Pourquoi Ndeletik bat <br /> <Mark /> <GradText>chaque concurrent</GradText>
          </h2>
          <p className="mt-4 max-w-md text-sm text-muted">
            Les autres outils ignorent ton marché. Ndeletik est construit autour du Mobile Money, du mobile et du français.
          </p>
          <BtnDark href="/auth" className="mt-6">
            Commencer
          </BtnDark>
        </div>

        {/*
          Tableau compact : table-fixed + largeurs en % = les 3 colonnes
          tiennent sur 320 px, SANS scroll horizontal.
          La bande dégradée (24 %) est alignée exactement sur la colonne Ndeletik.
        */}
        <div className="relative rounded-3xl border border-line bg-surface shadow-soft">
          <div className={`absolute inset-y-0 right-0 w-[24%] rounded-r-3xl ${grad}`} aria-hidden />

          <table className="relative w-full table-fixed text-left">
            <thead>
              <tr>
                <th className="p-3 sm:p-4" />
                <th className="w-[18%] p-3 text-center text-[10px] font-semibold text-muted sm:p-4 sm:text-xs">
                  Autres
                </th>
                <th className="w-[24%] p-3 text-center font-display text-[11px] font-bold text-white sm:p-4 sm:text-sm">
                  Ndeletik
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r} className="border-t border-line/70">
                  <td className="p-3 text-[11px] font-medium leading-snug sm:p-4 sm:text-sm">
                    {r}
                  </td>
                  <td className="p-3 text-center sm:p-4">
                    {others[i] ? (
                      <Check size={15} className="mx-auto text-muted" />
                    ) : (
                      <Minus size={15} className="mx-auto text-muted/50" />
                    )}
                  </td>
                  <td className="p-3 text-center sm:p-4">
                    <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-white text-fractal-terra">
                      <Check size={13} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}