"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { config } from "@/lib/config";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 relative">
      <div className="max-w-4xl mx-auto px-6">
        <SectionHeading
          title="Réponses aux questions fréquentes"
          subtitle="Tout ce que tu dois savoir sur Ndeletik"
          highlight="questions fréquentes"
        />

        <div className="mt-16 space-y-4">
          {config.faq.map((item, i) => (
            <div
              key={i}
              className="bg-savane-card/50 border border-savane-border rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-savane-card transition-colors"
                aria-expanded={openIndex === i}
              >
                <span className="text-lg font-semibold text-white pr-4">
                  {item.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {openIndex === i ? (
                    <X className="w-5 h-5 text-fractal-ocre flex-shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-gray-400 leading-relaxed">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}