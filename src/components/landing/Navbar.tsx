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

        {/* Liens desktop */}
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
          <BtnDark href="/auth" className="hidden sm:inline-flex">
            Créer ma page
          </BtnDark>
          {/* Burger mobile */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
            className="p-2 rounded-full hover:bg-soft text-ink md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Panneau mobile */}
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
          <BtnDark href="/auth" className="mt-3 w-full sm:hidden">
            Créer ma page
          </BtnDark>
        </div>
      )}
    </header>
  );
}