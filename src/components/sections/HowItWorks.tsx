"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { config } from "@/lib/config";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link, Sparkles, Share2 } from "lucide-react";

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          title="Comment ça marche ?"
          subtitle="En 3 étapes simples"
          highlight="Comment ça marche"
        />

        <div className="mt-16 grid md:grid-cols-2 gap-12 items-center">
          {/* Steps */}
          <div className="space-y-4">
            {config.howItWorks.map((step, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`w-full text-left p-6 rounded-2xl transition-all ${
                  activeStep === i
                    ? "bg-fractal-ocre/10 border-2 border-fractal-ocre"
                    : "bg-savane-card/50 border-2 border-savane-border hover:border-fractal-ocre/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      activeStep === i
                        ? "bg-fractal-ocre text-white"
                        : "bg-savane-dark text-gray-400"
                    }`}
                  >
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="aspect-square flex items-center justify-center">
                {activeStep === 0 && (
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-fractal-ocre to-fractal-terra rounded-2xl flex items-center justify-center">
                      <Sparkles size={40} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Crée ton compte</h3>
                    <p className="text-gray-400">Email + mot de passe</p>
                  </div>
                )}
                {activeStep === 1 && (
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-fractal-ocre to-fractal-terra rounded-2xl flex items-center justify-center">
                      <Link size={40} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Ajoute tes liens</h3>
                    <p className="text-gray-400">Instagram, TikTok, WhatsApp...</p>
                  </div>
                )}
                {activeStep === 2 && (
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-fractal-ocre to-fractal-terra rounded-2xl flex items-center justify-center">
                      <Share2 size={40} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Partage ton lien</h3>
                    <p className="text-gray-400">ndeletik.com/@tonnom</p>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}