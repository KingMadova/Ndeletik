import Link from "next/link";
import type { ReactNode } from "react";

export const grad = "bg-gradient-to-r from-fractal-or via-fractal-ocre to-fractal-terra";

export function Logo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <linearGradient id="nd-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F9A825" />
          <stop offset="1" stopColor="#C1440E" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="14" r="10" fill="#FF6A1A" />
      <path d="M12 32 C26 30 40 36 46 46 L40 92 C30 70 16 52 12 32Z" fill="url(#nd-g)" />
      <path d="M88 32 C74 30 60 36 54 46 L60 92 C70 70 84 52 88 32Z" fill="#C1440E" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight">
      <Logo /> Ndeletik
    </span>
  );
}

export function Mark({ size = "1em" }: { size?: string }) {
  return (
    <span
      className={`mx-1 inline-flex translate-y-[0.08em] items-center justify-center rounded-[0.28em] ${grad} shadow-soft`}
      style={{ width: size, height: size }}
    >
      <Logo className="h-[62%] w-[62%] brightness-0 invert" />
    </span>
  );
}

export function GradText({ children }: { children: ReactNode }) {
  return <span className={`${grad} bg-clip-text text-transparent`}>{children}</span>;
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
      {children}
    </span>
  );
}

export function BtnDark({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg shadow-lg transition hover:opacity-90 ${className}`}
    >
      {children}
    </Link>
  );
}

export function SectionTitle({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {label && (
        <div className="mb-3">
          <Badge>{label}</Badge>
        </div>
      )}
      <h2 className="font-display text-3xl font-bold leading-tight md:text-5xl">{children}</h2>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-line bg-surface shadow-soft ${className}`}>{children}</div>;
}