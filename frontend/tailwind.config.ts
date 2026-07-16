
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── CAADS Design Tokens ──────────────────────────────────
      colors: {
        bg: {
          DEFAULT: "#0A0A0A",
          secondary: "#151515",
        },
        gold: {
          DEFAULT: "#C9A227",
          bright: "#E8B93E",
        },
        ivory: "#F2EDE4",
        muted: "#B8B2A7",
        "border-gold": "#7A5C1E",
      },
      // ── Typography ───────────────────────────────────────────
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-ibm-plex-sans)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      // ── Border radius ────────────────────────────────────────
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      // ── Box shadows (gold glow) ───────────────────────────────
      boxShadow: {
        gold: "0 0 0 1px #7A5C1E, 0 4px 24px 0 rgba(201,162,39,0.12)",
        "gold-lg": "0 0 0 1px #7A5C1E, 0 8px 40px 0 rgba(201,162,39,0.20)",
      },
    },
  },
  plugins: [],
};

export default config;
