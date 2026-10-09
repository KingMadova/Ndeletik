import Link from "next/link";
import { Mail, MessageCircle, ArrowLeft, Clock, HelpCircle } from "lucide-react";
import { Wordmark } from "@/components/landing/ui";

export const metadata = {
  title: "Contact — Ndeletik",
  description: "Contacte l'équipe Ndeletik par email ou WhatsApp. Réponse sous 48h ouvrées.",
};

/* ⚠️ Remplace par tes vrais canaux avant le push */
const EMAIL = "hello@ndeletik.com";
const WHATSAPP = "242060000000";

export default function ContactPage() {
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
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Contact</h1>
        <p className="mt-3 text-sm text-muted">
          Une question, un problème, un partenariat ? Deux canaux directs, sans formulaire inutile.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <a
            href={`mailto:${EMAIL}?subject=[Ndeletik]%20Contact`}
            className="group rounded-2xl border border-line bg-surface p-5 shadow-soft transition-colors hover:border-fractal-ocre"
          >
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-soft text-fractal-ocre">
              <Mail size={18} />
            </span>
            <h2 className="text-sm font-bold">Email</h2>
            <p className="mt-1 text-xs text-muted break-all">{EMAIL}</p>
            <p className="mt-2 text-[11px] text-fractal-terra opacity-0 transition-opacity group-hover:opacity-100">
              Cliquer pour écrire →
            </p>
          </a>

          <a
            href={`https://wa.me/${WHATSAPP}?text=Bonjour%20Ndeletik%20!`}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-line bg-surface p-5 shadow-soft transition-colors hover:border-fractal-ocre"
          >
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-soft text-fractal-ocre">
              <MessageCircle size={18} />
            </span>
            <h2 className="text-sm font-bold">WhatsApp</h2>
            <p className="mt-1 text-xs text-muted">Support rapide, du lundi au samedi.</p>
            <p className="mt-2 text-[11px] text-fractal-terra opacity-0 transition-opacity group-hover:opacity-100">
              Ouvrir la conversation →
            </p>
          </a>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-line bg-soft p-5 text-sm sm:flex-row sm:items-center">
          <Clock size={16} className="shrink-0 text-fractal-ocre" />
          <p className="text-muted">
            Délai de réponse habituel : <span className="font-semibold text-ink">moins de 48 h ouvrées</span>. Pour
            les urgences de paiement, précise ta commande dans le premier message.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-line p-5 text-sm">
          <HelpCircle size={16} className="shrink-0 text-fractal-ocre" />
          <p className="text-muted">
            La plupart des réponses sont déjà dans la{" "}
            <Link href="/#faq" className="font-semibold text-fractal-terra hover:text-fractal-ocre">
              FAQ
            </Link>
            .
          </p>
        </div>
      </article>
    </main>
  );
}