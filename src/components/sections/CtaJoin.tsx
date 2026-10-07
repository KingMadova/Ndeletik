"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function CtaJoin() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-savane-card/30 to-savane-dark" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-fractal-ocre to-fractal-terra rounded-2xl mb-8">
            <Sparkles size={32} className="text-white" />
          </div>

          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Prêt à lancer <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fractal-ocre to-fractal-terra">
              ton héritage digital ?
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Rejoins des milliers de créateurs africains qui utilisent déjà Ndeletik pour partager leur univers.
          </p>

          <Link href="/auth">
            <Button variant="primary" size="lg" className="group">
              Commencer gratuitement
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-fractal-ocre" />
              Gratuit sans carte bancaire
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-fractal-ocre" />
              Annulation à tout moment
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-fractal-ocre" />
              Support 24/7
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CheckCircle({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}