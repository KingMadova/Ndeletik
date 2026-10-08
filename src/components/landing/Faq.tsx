"use client";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { GradText, Mark, SectionTitle } from "./ui";

const faqs = [
  ["Comment créer ma page ?", "Crée ton compte, ajoute tes liens et choisis ton design. Ta page est en ligne en quelques minutes."],
  ["Ndeletik est-il vraiment gratuit ?", "Oui. Le plan Gratuit n'a pas de limite de durée. Tu passes à Pro quand tu veux plus."],
  ["Comment je reçois mes paiements ?", "Tes clients paient par Mobile Money. L'argent arrive sur le numéro que tu as enregistré."],
  ["Puis-je changer le design de ma page ?", "À tout moment : couleurs, boutons, polices et photo de profil se modifient en direct."],
  ["Ma page marche-t-elle avec une connexion lente ?", "Oui. Elle est légère et optimisée pour le mobile."],
  ["Puis-je utiliser mon propre nom de domaine ?", "Oui, avec le plan Business."],
  ["Où voir mes statistiques ?", "Dans ton tableau de bord : clics par lien, par jour et par source."],
  ["Comment annuler mon abonnement ?", "Depuis tes paramètres, en un clic. Tu gardes ton accès jusqu'à la fin de la période payée."],
];

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-line bg-surface shadow-soft">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-4 text-left text-sm font-medium"
      >
        {q}
        {open ? <Minus size={16} className="shrink-0 text-fractal-ocre" /> : <Plus size={16} className="shrink-0 text-muted" />}
      </button>
      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <p className="overflow-hidden px-4 text-sm text-muted">
          <span className="block pb-4">{a}</span>
        </p>
      </div>
    </div>
  );
}

export function Faq() {
  return (
    <section id="faq" className="px-6 py-20">
      <SectionTitle label="FAQ">
        Tes questions, <Mark /> <GradText>nos réponses</GradText>
      </SectionTitle>
      <div className="mx-auto grid max-w-5xl items-start gap-3 md:grid-cols-2">
        {faqs.map(([q, a]) => (
          <Item key={q} q={q} a={a} />
        ))}
      </div>
    </section>
  );
}