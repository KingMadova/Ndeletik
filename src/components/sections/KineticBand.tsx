"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function KineticBand() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  return (
    <section ref={containerRef} className="py-16 overflow-hidden">
      <motion.div style={{ x }} className="flex gap-8 whitespace-nowrap">
        {[...Array(3)].map((_, i) => (
          <span
            key={i}
            className="text-6xl md:text-8xl lg:text-9xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-fractal-ocre to-fractal-terra"
          >
            Liens illimités • Design unique • Mobile Money • Analytics avancés •{" "}
          </span>
        ))}
      </motion.div>
    </section>
  );
}