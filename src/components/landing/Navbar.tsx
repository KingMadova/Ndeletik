"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { BtnDark, Wordmark } from "./ui";

const links = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#etapes", label: "Étapes" },
  { href: "#calculateur", label: "Calculateur" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="flex w-full max-w-4xl items-center justify-between rounded-full border border-line bg-surface/85 py-2 pl-5 pr-2 shadow-soft backdrop-blur-xl">
        <Link href="/" aria-label="Ndeletik" onClick={() => setOpen(false)}>
          <Wordmark />
        </Link>

        <ul className="hidden items-center gap-6 text-sm text-muted md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="transition hover:text-ink">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/auth?mode=login"
            className="hidden rounded-full px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fractal-ocre sm:inline-flex"
          >
            Connexion
          </Link>
          <BtnDark href="/auth?mode=signup" className="hidden sm:inline-flex">
            Créer ma page
          </BtnDark>
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            className="rounded-full p-2 text-ink hover:bg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fractal-ocre md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="absolute top-full mt-2 w-full max-w-4xl rounded-2xl border border-line bg-surface p-4 shadow-soft md:hidden">
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm text-muted hover:bg-soft hover:text-ink"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href="/auth?mode=login"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center rounded-full border border-line px-4 py-3 text-sm font-medium text-ink transition hover:bg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fractal-ocre"
            >
              Connexion
            </Link>
            <BtnDark href="/auth?mode=signup" className="w-full">
              Créer ma page
            </BtnDark>
          </div>
        </div>
      )}
    </header>
  );
}
