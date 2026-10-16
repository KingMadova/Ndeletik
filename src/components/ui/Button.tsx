import { forwardRef, type ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fractal-ocre " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-fractal-ocre text-white shadow-soft hover:bg-fractal-terra",
  secondary: "border border-line bg-surface text-ink hover:border-fractal-ocre hover:text-fractal-terra",
  ghost: "text-muted hover:bg-soft hover:text-ink",
  danger: "text-red-600 hover:bg-red-50",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-sm",
};

/** Classes d'un bouton : à utiliser aussi sur <Link> / <a> pour garder le même rendu. */
export function buttonClass({
  variant = "primary",
  size = "md",
  full = false,
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; full?: boolean; className?: string } = {}) {
  // twMerge : une classe passée en `className` (ex. « hidden sm:inline-flex ») l'emporte sur celles du bouton.
  return twMerge(clsx(base, variants[variant], sizes[size], full && "w-full", className));
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant, size, full, className, type = "button", ...rest },
  ref
) {
  return <button ref={ref} type={type} className={buttonClass({ variant, size, full, className })} {...rest} />;
});
