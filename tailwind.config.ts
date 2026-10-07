import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        savane: {
          dark: "#0F1115",
          card: "#1A1D24",
          border: "#2D323E",
        },
        fractal: {
          ocre: "#D49A44",
          terra: "#C85A47",
          or: "#E8C365",
          indigo: "#2B3A67",
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-outfit)', 'sans-serif'],
      },
      backgroundImage: {
        'fractal-gradient': 'radial-gradient(circle at 50% 50%, rgba(212, 154, 68, 0.15) 0%, rgba(15, 17, 21, 0) 70%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;