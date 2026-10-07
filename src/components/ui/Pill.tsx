import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface PillProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "accent";
  children: React.ReactNode;
}

export const Pill = forwardRef<HTMLDivElement, PillProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
          {
            "bg-savane-card/50 border border-savane-border text-gray-300": variant === "default",
            "bg-fractal-ocre/10 border border-fractal-ocre/30 text-fractal-ocre": variant === "accent",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Pill.displayName = "Pill";