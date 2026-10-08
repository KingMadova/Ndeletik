import Link from "next/link";
import { BtnDark, Wordmark } from "./ui";

const links = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#etapes", label: "Étapes" },
  { href: "#calculateur", label: "Calculateur" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="flex w-full max-w-4xl items-center justify-between rounded-full border border-line bg-surface/85 py-2 pl-5 pr-2 shadow-soft backdrop-blur-xl">
        <Link href="/" aria-label="Ndeletik">
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
        <BtnDark href="/auth">Créer ma page</BtnDark>
      </nav>
    </header>
  );
}