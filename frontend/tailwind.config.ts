
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
          DEFAULT:   "#FAF8F4",  // cream white
          secondary: "#EDE8E0",  // warm cream — cards/sections
        },
        gold: {
          DEFAULT: "#C9A227",
          bright:  "#E8B93E",
        },
        ivory:         "#1C1611", // warm near-black — primary text
        muted:         "#7A7268", // warm mid-gray — secondary text
        "border-gold": "#7A5C1E",
      },
      // ── Typography ───────────────────────────────────────────
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-ibm-plex-sans)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
        // Signature fonts — Office Bearers section
        "sig-mrs-saint-delafield": ["var(--font-mrs-saint-delafield)", "cursive"],
        "sig-mr-de-haviland": ["var(--font-mr-de-haviland)", "cursive"],
        "sig-herr-von-muellerhoff": ["var(--font-herr-von-muellerhoff)", "cursive"],
        "sig-monsieur-la-doulaise": ["var(--font-monsieur-la-doulaise)", "cursive"],
        "sig-miss-fajardose": ["var(--font-miss-fajardose)", "cursive"],
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
