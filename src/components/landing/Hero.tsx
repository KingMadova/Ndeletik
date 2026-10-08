"use client";
import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTelegram,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { BtnDark, Badge, GradText, Logo, Mark, grad } from "./ui";

const wordVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(12px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

type Platform = { name: string; Icon: IconType; bg: string };

// Couleurs officielles des apps.
const platforms: Platform[] = [
  { name: "Facebook", Icon: FaFacebookF, bg: "#1877F2" },
  { name: "TikTok", Icon: FaTiktok, bg: "#010101" },
  {
    name: "Instagram",
    Icon: FaInstagram,
    bg: "linear-gradient(45deg,#FEDA75 0%,#FA7E1E 25%,#D62976 50%,#962FBF 75%,#4F5BD5 100%)",
  },
  { name: "WhatsApp", Icon: FaWhatsapp, bg: "#25D366" },
  { name: "YouTube", Icon: FaYoutube, bg: "#FF0000" },
  { name: "X", Icon: FaXTwitter, bg: "#000000" },
  { name: "LinkedIn", Icon: FaLinkedinIn, bg: "#0A66C2" },
  { name: "Telegram", Icon: FaTelegram, bg: "#26A5E4" },
];

const R = 36; // rayon de l'anneau, en % de la scène

const nodes = platforms.map((p, i) => {
  const a = ((i * 360) / platforms.length - 90 + 22.5) * (Math.PI / 180);
  const x = 50 + R * Math.cos(a);
  const y = 50 + R * Math.sin(a);
  // Courbe légère : point de contrôle décalé perpendiculairement.
  const mx = (50 + x) / 2;
  const my = (50 + y) / 2;
  const nx = -Math.sin(a);
  const ny = Math.cos(a);
  const k = i % 2 === 0 ? 5 : -5;
  const d = `M ${x.toFixed(2)} ${y.toFixed(2)} Q ${(mx + nx * k).toFixed(2)} ${(my + ny * k).toFixed(2)} 50 50`;
  return { ...p, x, y, d };
});

function Scene() {
  return (
    // Le carré s'adapte à la hauteur ET à la largeur disponibles : rien n'est coupé.
    <div
      className="flex h-full min-h-0 w-full items-center justify-center"
      style={{ containerType: "size" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="relative"
        style={{ width: "min(100cqw, 100cqh)", height: "min(100cqw, 100cqh)" }}
      >
        <div
          aria-hidden
          className="absolute inset-[8%] rounded-full bg-gradient-to-br from-fractal-or/25 via-fractal-ocre/15 to-fractal-terra/20 blur-2xl"
        />

        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <linearGradient id="hero-line" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100">
              <stop offset="0" stopColor="#F9A825" />
              <stop offset="0.5" stopColor="#FF6A1A" />
              <stop offset="1" stopColor="#C1440E" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="rgb(var(--line))"
            strokeWidth="0.3"
            strokeDasharray="1 1.6"
          />
          {nodes.map((n, i) => (
            <g key={n.name}>
              <path
                d={n.d}
                fill="none"
                stroke="url(#hero-line)"
                strokeWidth="0.7"
                strokeLinecap="round"
                opacity="0.55"
              />
              <circle r="1.3" fill="#FF6A1A">
                <animateMotion
                  dur="3.2s"
                  begin={`${(i * 0.4).toFixed(1)}s`}
                  repeatCount="indefinite"
                  path={n.d}
                />
              </circle>
            </g>
          ))}
        </svg>

        {/* Logo central Ndeletik */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: "26%", height: "26%" }}
        >
          <span aria-hidden className={`absolute inset-0 animate-ping rounded-[28%] ${grad} opacity-20`} />
          <div
            className={`relative flex h-full w-full items-center justify-center rounded-[28%] ${grad} shadow-[0_12px_40px_-8px_rgba(193,68,14,.55)] ring-4 ring-surface`}
          >
            <Logo className="h-[62%] w-[62%] brightness-0 invert" />
          </div>
        </div>

        {/* Icônes d'apps officielles */}
        {nodes.map((n, i) => (
          <motion.div
            key={n.name}
            title={n.name}
            role="img"
            aria-label={n.name}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.07, type: "spring", stiffness: 260, damping: 18 }}
            className="absolute flex items-center justify-center text-white shadow-lg ring-2 ring-surface"
            style={{
              left: `${n.x}%`,
              top: `${n.y}%`,
              width: "16%",
              height: "16%",
              marginLeft: "-8%",
              marginTop: "-8%",
              borderRadius: "24%",
              background: n.bg,
            }}
          >
            <n.Icon className="h-1/2 w-1/2" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export function Hero() {
  return (
    <section
      className="relative h-screen overflow-hidden px-5 pb-4 pt-20 md:px-10 md:pt-24"
      style={{ height: "100svh" }}
    >
      <div className="mx-auto flex h-full max-w-6xl flex-col md:grid md:grid-cols-2 md:items-center md:gap-8">
        {/* Colonne texte */}
        <div className="shrink-0 text-center md:text-left">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-3 md:mb-5">
            <Badge>
              <span className={`h-2 w-2 rounded-full ${grad}`} /> Conçu pour les créateurs africains
            </Badge>
          </motion.div>

          <motion.h1
            className="font-display text-[2.25rem] font-extrabold leading-[1.04] sm:text-5xl lg:text-6xl xl:text-7xl"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.1 }}
          >
            <span className="block">
              {["Tes", "liens,"].map((w) => (
                <motion.span
                  key={w}
                  variants={wordVariants}
                  transition={{ duration: 0.5 }}
                  className="mr-3 inline-block"
                >
                  {w}
                </motion.span>
              ))}
            </span>
            <span className="block">
              <motion.span variants={wordVariants} transition={{ duration: 0.5 }} className="mr-1 inline-block">
                ton
              </motion.span>
              <motion.span variants={wordVariants} transition={{ duration: 0.5 }} className="inline-block">
                <Mark size="0.8em" />
              </motion.span>
              <motion.span variants={wordVariants} transition={{ duration: 0.5 }} className="ml-2 inline-block">
                <GradText>héritage.</GradText>
              </motion.span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mx-auto mt-3 max-w-md text-sm text-muted md:mx-0 md:mt-5 md:text-lg"
          >
            Une seule page pour tous tes réseaux, ton design et tes paiements Mobile Money.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="mt-4 md:mt-7"
          >
            <BtnDark href="/auth" className="px-6 py-3 text-sm md:px-7 md:py-3.5 md:text-base">
              Créer ma page gratuite
            </BtnDark>
          </motion.div>
        </div>

        {/* Colonne scène : anneaux de plateformes */}
        <div className="mt-2 min-h-0 flex-1 md:mt-0 md:h-full md:max-h-[calc(100svh-8rem)]">
          <Scene />
        </div>
      </div>
    </section>
  );
}