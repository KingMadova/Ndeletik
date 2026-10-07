"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface MarqueeProps {
  text: string;
  className?: string;
}

export function Marquee({ text, className }: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  return (
    <div ref={containerRef} className="overflow-hidden py-8">
      <motion.div style={{ x }} className="flex gap-8 whitespace-nowrap">
        {[...Array(3)].map((_, i) => (
          <span key={i} className={className}>
            {text} • {text} • {text} •{" "}
          </span>
        ))}
      </motion.div>
    </div>
  );
}