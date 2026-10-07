"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Sparkles, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { config } from "@/lib/config";
import Link from "next/link";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-savane-dark/80 backdrop-blur-xl border-b border-savane-border"
            : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-fractal-ocre to-fractal-terra rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-xl font-display font-bold text-white">
              {config.brand}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {config.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm text-gray-300 hover:text-fractal-ocre transition-colors rounded-full hover:bg-savane-card/50"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth">
              <Button variant="ghost" size="sm">
                Connexion
              </Button>
            </Link>
            <Link href="/auth">
              <Button variant="primary" size="sm">
                <div className="w-2 h-2 bg-fractal-ocre rounded-full mr-2" />
                Créer ma page
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white p-2"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          className="fixed inset-0 z-40 bg-savane-dark md:hidden"
        >
          <div className="flex flex-col p-6 pt-20 space-y-4">
            {config.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-lg text-white hover:text-fractal-ocre py-2"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-4 space-y-3">
              <Link href="/auth" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full">
                  Connexion
                </Button>
              </Link>
              <Link href="/auth" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" className="w-full">
                  Créer ma page
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}