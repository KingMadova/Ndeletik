"use client";

import { motion } from "framer-motion";

const chips = [
  { text: "Instagram", x: "10%", y: "20%" },
  { text: "TikTok", x: "80%", y: "15%" },
  { text: "YouTube", x: "15%", y: "70%" },
  { text: "WhatsApp", x: "85%", y: "75%" },
  { text: "Shop", x: "50%", y: "85%" },
];

export function FloatingChips() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {chips.map((chip, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: chip.x, top: chip.y }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
        >
          <div className="bg-savane-card/50 border border-savane-border rounded-xl px-4 py-2 text-sm text-gray-400 backdrop-blur-sm">
            {chip.text}
          </div>
        </motion.div>
      ))}
    </div>
  );
}