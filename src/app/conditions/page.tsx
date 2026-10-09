import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/landing/ui";

export const metadata = {
  title: "Conditions d'utilisation — Ndeletik",
  description: "Les règles d'usage du service Ndeletik : comptes, contenus, plans, responsabilités.",
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

export default function ConditionsPage() {
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
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Conditions d'utilisation</h1>
        <p className="mt-3 text-xs text-muted">
          Dernière mise à jour : octobre 2026 · Modèle à faire relire par un juriste avant mise en conformité
          officielle.
        </p>

        <S n="1" t="Acceptation">
          <p>
            En créant un compte Ndeletik, tu acceptes les présentes conditions. Si tu les refuses, n'utilise pas le
            service.
          </p>
        </S>

        <S n="2" t="Compte">
          <p>
            Un compte par créateur. Tes identifiants restent confidentiels ; tu es responsable de tout usage fait
            depuis ton compte. Certains noms d'utilisateur (admin, support, marques…) sont réservés et peuvent être
            refusés ou repris.
          </p>
        </S>

        <S n="3" t="Service & plans">
          <p>
            Ndeletik fournit une page de liens publique, des statistiques, des raccourcis et, à terme, des
            paiements Mobile Money. Le plan Gratuit est sans limite de durée ; les plans Pro (3 000 FCFA/mois) et
            Business (9 000 FCFA/mois) débloquent des fonctionnalités étendues. Les prix peuvent évoluer moyennant
            un préavis de 30 jours ; les périodes déjà payées restent acquises.
          </p>
        </S>

        <S n="4" t="Contenus interdits">
          <p>
            Sont prohibés : contenus illégaux, haineux, diffamatoires, pornographiques, frauduleux (arnaques,
            phishing), incitation à la violence, vente de produits réglementés sans autorisation, malware et
            collecte de données trompeuse. Tout manquement entraîne suspension ou suppression, sans préavis en cas
            de gravité.
          </p>
        </S>

        <S n="5" t="Ta responsabilité">
          <p>
            Tu es seul responsable des liens publiés (destination, contenu cible, droits d'auteur) et de
            l'exactitude de tes informations publiques (prix, promesses commerciales…).
          </p>
        </S>

        <S n="6" t="Disponibilité">
          <p>
            Service fourni « en l'état », avec une obligation de moyens. Aucune garantie de disponibilité
            n'est offerte sur le plan Gratuit ; les incidents sont communiqués via la page contact.
          </p>
        </S>

        <S n="7" t="Responsabilité de Ndeletik">
          <p>
            Ndeletik ne saurait être tenu responsable des dommages indirects (perte de chiffre d'affaires,
            d'audience ou de données imputable à un tiers) ni du contenu des sites vers lesquels pointent tes
            liens.
          </p>
        </S>

        <S n="8" t="Résiliation">
          <p>
            Tu peux supprimer ton compte à tout moment depuis le dashboard ou par email. Nous pouvons suspendre un
            compte en cas de violation des présentes conditions ; les sommes payées pour la période en cours
            restent dues, sauf manquement de notre part.
          </p>
        </S>

        <S n="9" t="Loi applicable">
          <p>
            Les présentes conditions sont régies par le droit de la République du Congo. À défaut d'accord amiable,
            compétence exclusive des tribunaux de Brazzaville.
          </p>
        </S>

        <S n="10" t="Contact">
          <p>
            Questions :{" "}
            <Link href="/contact" className="text-fractal-terra">
              page contact
            </Link>{" "}
            ·{" "}
            <a href="mailto:hello@ndeletik.com" className="text-fractal-terra">
              hello@ndeletik.com
            </a>
          </p>
        </S>
      </article>
    </main>
  );
}