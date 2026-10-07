"use client";

import { motion } from "framer-motion";
import { config } from "@/lib/config";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link, Palette, BarChart3, Globe } from "lucide-react";

const iconMap: any = {
  Link,
  Palette,
  BarChart3,
  Globe,
};

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          title="Tout ce dont tu as besoin pour briller en ligne"
          subtitle="Une suite complète d'outils pour gérer ta présence digitale"
          highlight="briller en ligne"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mt-16">
          {config.features.map((feature, i) => {
            const Icon = iconMap[feature.icon];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <GlassCard className="group hover:border-fractal-ocre/50 transition-all hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-fractal-ocre to-fractal-terra rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon size={28} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}