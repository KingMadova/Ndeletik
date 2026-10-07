"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { FloatingChips } from "@/components/effects/FloatingChips";
import Link from "next/link";

const wordVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(12px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function Hero() {
  const words = ["Tes", "liens,", "ton", "héritage."];

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-12 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-fractal-ocre/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fractal-terra/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <FloatingChips />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Pill variant="accent">
            <Sparkles size={16} />
            Inspiré par les fractales africaines
          </Pill>
        </motion.div>

        <motion.h1
          className="text-6xl md:text-8xl lg:text-9xl font-display font-bold mb-8"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.1 }}
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariants}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-block mr-4"
            >
              {word === "héritage." ? (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-fractal-ocre via-fractal-terra to-fractal-or">
                  {word}
                </span>
              ) : (
                <span className="text-white">{word}</span>
              )}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12"
        >
          La page de liens nouvelle génération pour les créateurs africains.
          Simple, élégant et conçu pour le Mobile Money.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/auth">
            <Button variant="primary" size="lg" className="group">
              <div className="w-2 h-2 bg-fractal-ocre rounded-full mr-2" />
              Créer ma page gratuite
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/@demo">
            <Button variant="ghost" size="lg">
              Voir un exemple
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}