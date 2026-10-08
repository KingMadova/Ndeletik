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
    <section className="px-6 py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
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

        <div className="relative rounded-3xl border border-line bg-surface shadow-soft">
          <div className={`absolute inset-y-0 right-0 w-[26%] rounded-3xl ${grad}`} aria-hidden />
          <table className="relative w-full text-left text-sm">
            <thead>
              <tr>
                <th className="p-4" />
                <th className="w-[22%] p-4 text-center text-xs font-semibold text-muted">Autres</th>
                <th className="w-[26%] p-4 text-center font-display text-sm font-bold text-white">Ndeletik</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r} className="border-t border-line/70">
                  <td className="p-4 text-xs font-medium md:text-sm">{r}</td>
                  <td className="p-4 text-center">
                    {others[i] ? <Check size={16} className="mx-auto text-muted" /> : <Minus size={16} className="mx-auto text-muted/50" />}
                  </td>
                  <td className="p-4 text-center">
                    <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-white text-fractal-terra">
                      <Check size={14} />
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