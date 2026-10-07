import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  highlight?: string;
}

export function SectionHeading({
  title,
  subtitle,
  align = "center",
  className,
  highlight,
}: SectionHeadingProps) {
  const parts = title.split(highlight || "");
  
  return (
    <div
      className={cn(
        "space-y-4",
        {
          "text-center": align === "center",
          "text-left": align === "left",
        },
        className
      )}
    >
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight">
        {parts[0]}
        {highlight && (
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fractal-ocre to-fractal-terra">
            {highlight}
          </span>
        )}
        {parts[1]}
      </h2>
      {subtitle && (
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}