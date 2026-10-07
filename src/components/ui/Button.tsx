import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-fractal-ocre/50 focus:ring-offset-2 focus:ring-offset-savane-dark",
          {
            "bg-white text-savane-dark hover:bg-fractal-ocre hover:text-white hover:shadow-lg hover:shadow-fractal-ocre/25": variant === "primary",
            "bg-transparent text-white border border-savane-border hover:border-fractal-ocre hover:text-fractal-ocre": variant === "ghost",
          },
          {
            "h-9 px-4 text-sm": size === "sm",
            "h-10 px-6 text-base": size === "md",
            "h-12 px-8 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";