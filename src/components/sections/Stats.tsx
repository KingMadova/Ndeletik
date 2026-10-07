"use client";

import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";
import { config } from "@/lib/config";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Stats() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          title={`${config.stats[0].value.toLocaleString()} ${config.stats[0].suffix} créateurs nous font confiance`}
          subtitle="Rejoins une communauté grandissante de créateurs africains"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {config.stats.map((stat, i) => (
            <StatCard key={i} stat={stat} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, delay }: { stat: any; delay: number }) {
  const { count, ref } = useCountUp(stat.value, 2000);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-fractal-ocre mb-2">
        {count}
        {stat.suffix}
      </div>
      <div className="text-sm md:text-base text-gray-400">{stat.label}</div>
    </motion.div>
  );
}