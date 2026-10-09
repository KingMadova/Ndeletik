import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/landing/ui";

export const metadata = {
  title: "Confidentialité — Ndeletik",
  description: "Comment Ndeletik collecte, stocke et protège tes données personnelles.",
};

const S = ({ n, t, children }: { n: string; t: string; children: React.ReactNode }) => (
  <section className="mt-8">
    <h2 className="font-display text-lg font-bold">
      <span className="mr-2 text-fractal-ocre">{n}.</span>
      {t}
    </h2>
    <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted">{children}</div>
  </section>
);

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-bg text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/">
            <Wordmark />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fractal-terra transition-colors"
          >
            <ArrowLeft size={14} /> Accueil
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Politique de confidentialité</h1>
        <p className="mt-3 text-xs text-muted">
          Dernière mise à jour : octobre 2026 · Modèle à faire relire par un juriste avant mise en conformité
          officielle.
        </p>

        <S n="1" t="Qui sommes-nous ?">
          <p>
            Ndeletik est un service édité par YEKOLA Business, permettant aux créateurs de regrouper leurs liens,
            statistiques et paiements sur une page unique. Contact :{" "}
            <a href="mailto:hello@ndeletik.com" className="text-fractal-terra">
              hello@ndeletik.com
            </a>
            .
          </p>
        </S>

        <S n="2" t="Données collectées">
          <p>
            <span className="font-semibold text-ink">Compte :</span> email, nom d'utilisateur, pays, photo et
            bannière si tu en uploads une.
          </p>
          <p>
            <span className="font-semibold text-ink">Contenu :</span> tes liens, raccourcis et textes de profil —
            visibles publiquement par nature.
          </p>
          <p>
            <span className="font-semibold text-ink">Mesure d'audience :</span> nombre de vues de ta page et clics
            par lien (compteurs anonymes, sans profilage individuel).
          </p>
        </S>

        <S n="3" t="Ce que nous ne faisons pas">
          <p>Pas de revente de données. Pas de cookies publicitaires. Pas de tracking tiers.</p>
          <p>Le seul cookie technique est celui de ta session de connexion (Supabase Auth).</p>
        </S>

        <S n="4" t="Où sont stockées tes données ?">
          <p>
            Base de données et fichiers : Supabase (PostgreSQL + Storage). Hébergement de l'application : Vercel.
            Les images uploadées sont servies depuis le bucket privé « media » via des URLs signées.
          </p>
        </S>

        <S n="5" t="Durée de conservation">
          <p>
            Tant que ton compte existe. En cas de suppression (par toi ou pour manquement aux conditions), les
            données sont effacées sous 30 jours, sauvegardes techniques exceptées.
          </p>
        </S>

        <S n="6" t="Tes droits">
          <p>
            Accès et rectification : directement depuis ton dashboard (onglet Apparence). Suppression : bouton de
            suppression de compte ou demande par email. Portabilité : export de tes données sur simple demande.
          </p>
        </S>

        <S n="7" t="Paiements">
          <p>
            Aucun moyen de paiement n'est stocké chez Ndeletik. Lors de l'activation du Mobile Money, les
            transactions sont traitées par le prestataire de paiement (numéro de téléphone transmis à l'opérateur
            uniquement).
          </p>
        </S>

        <S n="8" t="Contact & réclamations">
          <p>
            Toute question relative à cette politique :{" "}
            <a href="mailto:hello@ndeletik.com" className="text-fractal-terra">
              hello@ndeletik.com
            </a>{" "}
            ou via la{" "}
            <Link href="/contact" className="text-fractal-terra">
              page contact
            </Link>
            .
          </p>
        </S>
      </article>
    </main>
  );
}