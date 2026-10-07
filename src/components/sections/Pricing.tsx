"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { config } from "@/lib/config";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import Link from "next/link";

export function Pricing() {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          title="Des tarifs simples et transparents"
          subtitle="Choisis le plan qui correspond à tes besoins"
          highlight="simples et transparents"
        />

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {config.pricing.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <GlassCard
                className={`relative h-full ${
                  plan.featured
                    ? "border-2 border-fractal-ocre shadow-2xl shadow-fractal-ocre/20"
                    : ""
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-fractal-ocre to-fractal-terra text-white text-sm font-semibold px-4 py-1 rounded-full">
                      Populaire
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-display font-bold text-white">
                      {plan.price === 0 ? "Gratuit" : `${plan.price}€`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-400">/mois</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-fractal-ocre flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/auth" className="block">
                  <Button
                    variant={plan.featured ? "primary" : "ghost"}
                    className="w-full"
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}