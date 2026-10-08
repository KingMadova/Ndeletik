import { Link2, Palette, Send, UserRound } from "lucide-react";
import { GradText, Mark, SectionTitle, grad } from "./ui";

const steps = [
  { n: "01", icon: UserRound, t: "Crée ton compte", d: "Inscris-toi avec ton e-mail ou ton numéro. C'est gratuit." },
  { n: "02", icon: Link2, t: "Ajoute tes liens", d: "WhatsApp, boutique, vidéos, formations : colle-les en quelques secondes." },
  { n: "03", icon: Palette, t: "Personnalise ton design", d: "Choisis tes couleurs, tes boutons et ta photo de profil." },
  { n: "04", icon: Send, t: "Partage ta page", d: "Mets ton lien Ndeletik dans ta bio et suis tes résultats." },
];

export function Steps() {
  return (
    <section id="etapes" className="px-6 py-20">
      <SectionTitle label="Comment ça marche">
        <Mark /> <GradText>4 étapes</GradText> pour te lancer
      </SectionTitle>
      <ol className="mx-auto max-w-3xl space-y-4">
        {steps.map((s) => (
          <li key={s.n} className="grid grid-cols-[1fr] overflow-hidden rounded-3xl border border-line bg-soft sm:grid-cols-2">
            <div className="flex flex-col justify-center p-6">
              <span className={`mb-3 w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white ${grad}`}>
                Étape {s.n}
              </span>
              <h3 className="font-display text-lg font-bold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted">{s.d}</p>
            </div>
            <div className="flex items-center justify-center bg-surface p-6 sm:rounded-l-3xl">
              <div className={`flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-soft ${grad}`}>
                <s.icon size={34} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}