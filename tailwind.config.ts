import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Variables RGB (mode clair/sombre auto)
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        soft: "rgb(var(--soft) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",

        // Palette Yekola Business
        fractal: {
          or: "#F9A825",
          ocre: "#FF6A1A",
          terra: "#C1440E",
          creme: "#FFF9F3",
        },

        // Anciennes couleurs savane conservées pour compatibilité
        savane: {
          dark: "#0F1115",
          card: "#1A1D24",
          border: "#2D323E",
        },
      },
      fontFamily: {
        display: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgb(0 0 0 / .04), 0 8px 24px -8px rgb(193 68 14 / .12)",
        glow: "0 0 30px -8px rgb(255 106 26 / .35)",
      },
      backgroundImage: {
        "yekola-gradient": "linear-gradient(135deg, #F9A825 0%, #FF6A1A 50%, #C1440E 100%)",
      },
    },
  },
  plugins: [],
};

export default config;