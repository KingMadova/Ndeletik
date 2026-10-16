"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Check, ExternalLink, Loader2, ShieldCheck, Smartphone, X } from "lucide-react";
import { FaWhatsapp, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa6";
import { SiShopify } from "react-icons/si";
import type { IconType } from "react-icons";

type DemoLink = { Icon: IconType; bg: string; title: string; platform: string };

const demoLinks: DemoLink[] = [
  { Icon: FaWhatsapp, bg: "#25D366", title: "Commander sur WhatsApp", platform: "WhatsApp" },
  { Icon: SiShopify, bg: "#95BF47", title: "Ma boutique en ligne", platform: "ta boutique en ligne" },
  {
    Icon: FaInstagram,
    bg: "linear-gradient(45deg,#FEDA75 0%,#FA7E1E 25%,#D62976 50%,#962FBF 75%,#4F5BD5 100%)",
    title: "Mon Instagram",
    platform: "Instagram",
  },
  { Icon: FaYoutube, bg: "#FF0000", title: "Ma chaîne YouTube", platform: "YouTube" },
  { Icon: FaTiktok, bg: "#010101", title: "Mon TikTok", platform: "TikTok" },
];

const OPERATORS = ["MTN", "Airtel", "Wave"] as const;
const PRICE = new Intl.NumberFormat("fr-FR").format(15000);

type Active = { kind: "link"; link: DemoLink } | { kind: "pay" } | null;

export function DemoLinks() {
  const [active, setActive] = useState<Active>(null);
  const opener = useRef<HTMLElement | null>(null);

  const open = (a: Exclude<Active, null>) => {
    opener.current = document.activeElement as HTMLElement | null;
    setActive(a);
  };
  const close = useCallback(() => {
    setActive(null);
    opener.current?.focus();
  }, []);

  const rowCls =
    "group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-line bg-surface px-6 py-4 text-left shadow-soft transition-colors hover:border-fractal-ocre/60";

  return (
    <>
      <section className="mt-10 space-y-4" aria-label="Liens de démonstration">
        {demoLinks.map((l) => (
          <button key={l.title} type="button" aria-haspopup="dialog" onClick={() => open({ kind: "link", link: l })} className={rowCls}>
            <span className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-fractal-or via-fractal-ocre to-fractal-terra opacity-0 transition-opacity group-hover:opacity-100" />
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-soft"
              style={{ background: l.bg }}
            >
              <l.Icon size={18} aria-hidden />
            </span>
            <span className="flex-1 font-medium text-ink transition-colors group-hover:text-fractal-terra">{l.title}</span>
            <ExternalLink
              size={18}
              aria-hidden
              className="text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fractal-ocre"
            />
          </button>
        ))}

        {/* Aperçu du paiement Mobile Money tel que le verront les clients */}
        <div className="rounded-2xl border border-fractal-ocre/40 bg-surface p-5 shadow-soft">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-fractal-ocre/10 px-2.5 py-0.5 text-[11px] font-semibold text-fractal-terra">
            <Smartphone size={11} aria-hidden /> Aperçu paiement
          </span>
          <h2 className="mt-3 font-display text-lg font-bold text-ink">Formation : lancer sa boutique WhatsApp</h2>
          <p className="mt-1 text-sm text-muted">6 modules vidéo + guide PDF. Accès immédiat après paiement.</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="font-display text-xl font-extrabold text-ink">
              {PRICE} <span className="text-sm font-medium text-muted">FCFA</span>
            </span>
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => open({ kind: "pay" })}
              className="rounded-full bg-gradient-to-r from-fractal-or via-fractal-ocre to-fractal-terra px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Payer par Mobile Money
            </button>
          </div>
        </div>
      </section>

      {active && (
        <Sheet onClose={close} label={active.kind === "pay" ? "Aperçu du paiement Mobile Money" : "Aperçu du lien"}>
          {active.kind === "link" ? <LinkSim link={active.link} onClose={close} /> : <PaySim onClose={close} />}
        </Sheet>
      )}
    </>
  );
}

/* ---------- Fenêtre : Échap, clic sur le fond, focus piégé puis rendu à l'ouvreur ---------- */
function Sheet({ onClose, label, children }: { onClose: () => void; label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const node = ref.current;
    (node?.querySelector<HTMLElement>("[data-autofocus]") ?? node)?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab" || !node) return;
      const items = Array.from(
        node.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])")
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/50 p-4 sm:items-center" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        aria-describedby={titleId}
        tabIndex={-1}
        className="relative w-full max-w-sm rounded-3xl outline-none border border-line bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-soft"
        >
          <X size={18} aria-hidden />
        </button>
        <div id={titleId}>{children}</div>
      </div>
    </div>,
    document.body
  );
}

const ctaCls =
  "inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-medium text-bg transition hover:opacity-90";
const ghostCls =
  "inline-flex w-full items-center justify-center rounded-full border border-line px-5 py-3 text-sm font-medium text-muted hover:bg-soft";

function SimBadge() {
  return (
    <span className="inline-flex rounded-full bg-soft px-2.5 py-0.5 text-[11px] font-semibold text-muted">
      Simulation
    </span>
  );
}

function LinkSim({ link, onClose }: { link: DemoLink; onClose: () => void }) {
  return (
    <div>
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-soft" style={{ background: link.bg }}>
        <link.Icon size={22} aria-hidden />
      </span>
      <div className="mt-4">
        <SimBadge />
      </div>
      <h3 className="mt-2 font-display text-lg font-bold text-ink">Ici, ce bouton ouvrirait {link.platform}</h3>
      <p className="mt-2 text-sm text-muted">
        Cette page est une démonstration, donc rien ne s'ouvre. Sur ta page, tes visiteurs arrivent directement sur ton vrai lien.
      </p>
      <div className="mt-5 space-y-2">
        <Link href="/auth" className={ctaCls} data-autofocus>
          Créer ma page gratuite
        </Link>
        <button type="button" onClick={onClose} className={ghostCls}>
          Continuer la démo
        </button>
      </div>
    </div>
  );
}

function PaySim({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"choose" | "wait" | "done">("choose");
  const [operator, setOperator] = useState<(typeof OPERATORS)[number] | null>(null);

  useEffect(() => {
    if (step !== "wait") return;
    const t = setTimeout(() => setStep("done"), 1800);
    return () => clearTimeout(t);
  }, [step]);

  if (step === "wait") {
    return (
      <div className="py-6 text-center" role="status" aria-live="polite">
        <Loader2 size={32} className="mx-auto animate-spin text-fractal-ocre" aria-hidden />
        <h3 className="mt-4 font-display text-lg font-bold text-ink">Confirme sur ton téléphone</h3>
        <p className="mt-2 text-sm text-muted">Ton client valide le paiement avec son code {operator}.</p>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="text-center" role="status" aria-live="polite">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-fractal-ocre/10 text-fractal-terra">
          <Check size={24} aria-hidden />
        </span>
        <div className="mt-3">
          <SimBadge />
        </div>
        <h3 className="mt-2 font-display text-lg font-bold text-ink">Paiement simulé</h3>
        <p className="mt-2 text-sm text-muted">
          Aucun argent n'a été débité. C'est le parcours que verront tes clients sur ta page.
        </p>
        <div className="mt-5 space-y-2">
          <Link href="/auth" className={ctaCls} data-autofocus>
            Créer ma page gratuite
          </Link>
          <button type="button" onClick={onClose} className={ghostCls}>
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SimBadge />
      <h3 className="mt-2 font-display text-lg font-bold text-ink">Payer {PRICE} FCFA</h3>
      <p className="mt-1 text-sm text-muted">Choisis ton opérateur Mobile Money.</p>
      <div role="radiogroup" aria-label="Opérateur Mobile Money" className="mt-4 grid grid-cols-3 gap-2">
        {OPERATORS.map((o, i) => {
          const on = operator === o;
          return (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={on}
              data-autofocus={i === 0 ? "" : undefined}
              onClick={() => setOperator(o)}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                on ? "border-fractal-ocre bg-fractal-ocre/10 text-fractal-terra" : "border-line text-ink hover:bg-soft"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        disabled={!operator}
        onClick={() => setStep("wait")}
        className="mt-5 w-full rounded-full bg-gradient-to-r from-fractal-or via-fractal-ocre to-fractal-terra px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Payer {PRICE} FCFA
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
        <ShieldCheck size={13} aria-hidden /> Démonstration : aucun paiement réel
      </p>
    </div>
  );
}
