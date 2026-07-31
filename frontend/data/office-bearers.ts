// ── Signature font and color type definitions ─────────────────────────────

export type SignatureFont =
  | "mrs-saint-delafield"
  | "mr-de-haviland"
  | "herr-von-muellerhoff"
  | "monsieur-la-doulaise"
  | "miss-fajardose";

// Maps font key → CSS variable (used as inline style — avoids Tailwind JIT purge)
export const SIGNATURE_FONT_VAR: Record<SignatureFont, string> = {
  "mrs-saint-delafield":  "var(--font-mrs-saint-delafield)",
  "mr-de-haviland":       "var(--font-mr-de-haviland)",
  "herr-von-muellerhoff": "var(--font-herr-von-muellerhoff)",
  "monsieur-la-doulaise": "var(--font-monsieur-la-doulaise)",
  "miss-fajardose":       "var(--font-miss-fajardose)",
};

// Warm-metal color palette — flat color only, no glow
export const SIGNATURE_COLORS = {
  "deep-bronze":     "#8C6A2F",
  "classic-gold":    "#C9A227",
  "bright-gold":     "#E8B93E",
  champagne:         "#D9C89A",
  "antique-brass":   "#A67C3D",
  "warm-ivory-gold": "#E0D3B8",
} as const;

export type SignatureColorKey = keyof typeof SIGNATURE_COLORS;

// ── Leader type ────────────────────────────────────────────────────────────

export type Leader = {
  name: string;
  role: string;
  tier: number;
  photoUrl: string | null;
  signatureFont: SignatureFont;
  signatureColor: string;
  tagline?: string;
};

// ── Roster — hierarchy order per user spec ─────────────────────────────────
// President → VP → Secretary → Coordinators → Club Heads → Events Head → Media Heads
// Array order IS the render order within each tier. Do not sort programmatically.

export const OFFICE_BEARERS: Leader[] = [
  // ── Tier 1: President ─────────────────────────────────────────────
  {
    name: "Stacy Anna Dsouza",
    role: "President",
    tier: 1,
    photoUrl: "/images/leaders/stacy.jpeg",
    signatureFont: "herr-von-muellerhoff",
    signatureColor: SIGNATURE_COLORS["bright-gold"],
  },

  // ── Tier 2: Vice President ────────────────────────────────────────
  {
    name: "Harshdeep Sharma",
    role: "Vice President",
    tier: 2,
    photoUrl: "/images/leaders/harshdeep.jpeg",
    signatureFont: "mr-de-haviland",
    signatureColor: SIGNATURE_COLORS["deep-bronze"],
  },

  // ── Tier 3: Secretary ─────────────────────────────────────────────
  {
    name: "Sanjana Sudhir Ullal",
    role: "Secretary",
    tier: 3,
    photoUrl: "/images/leaders/sanjana.JPEG",
    signatureFont: "mrs-saint-delafield",
    signatureColor: SIGNATURE_COLORS["champagne"],
  },

  // ── Tier 4: Club Coordinators (co-equal) ─────────────────────────
  {
    name: "Prajwal S Hangaragi",
    role: "Club Coordinator",
    tier: 4,
    photoUrl: "/images/leaders/prajwal s.jpeg",
    signatureFont: "monsieur-la-doulaise",
    signatureColor: SIGNATURE_COLORS["antique-brass"],
  },
  {
    name: "Merwin Pinto",
    role: "Club Coordinator",
    tier: 4,
    photoUrl: "/images/leaders/merwin.jpeg",
    signatureFont: "mrs-saint-delafield",
    signatureColor: SIGNATURE_COLORS["classic-gold"],
  },

  // ── Tier 5: Club Heads — AI then Data Science (co-equal) ─────────
  {
    name: "Joel J George",
    role: "AI Club Head",
    tier: 5,
    photoUrl: "/images/leaders/joel j.jpeg",
    signatureFont: "miss-fajardose",
    signatureColor: SIGNATURE_COLORS["champagne"],
  },
  {
    name: "Prajwal V L",
    role: "AI Club Head",
    tier: 5,
    photoUrl: "/images/leaders/prajwal_v_l_v2.jpeg",
    signatureFont: "monsieur-la-doulaise",
    signatureColor: SIGNATURE_COLORS["antique-brass"],
  },
  {
    name: "Joel Anthony Dsilva",
    role: "Data Science Club Head",
    tier: 5,
    photoUrl: "/images/leaders/joel d silva.jpeg",
    signatureFont: "mr-de-haviland",
    signatureColor: SIGNATURE_COLORS["deep-bronze"],
  },
  {
    name: "Turimella Lakshmi Swetha",
    role: "Data Science Club Head",
    tier: 5,
    photoUrl: "/images/leaders/lakshmi.jpeg",
    signatureFont: "miss-fajardose",
    signatureColor: SIGNATURE_COLORS["warm-ivory-gold"],
  },

  // ── Tier 6: Events Head ───────────────────────────────────────────
  {
    name: "Vedant Joshi",
    role: "Events Head",
    tier: 6,
    photoUrl: "/images/leaders/vedant.jpeg",
    signatureFont: "monsieur-la-doulaise",
    signatureColor: SIGNATURE_COLORS["classic-gold"],
  },

  // ── Tier 7: Media Heads (co-equal) ───────────────────────────────
  {
    name: "Jemimah Anna Anil",
    role: "Media Head",
    tier: 7,
    photoUrl: "/images/leaders/jeminah.JPEG",
    signatureFont: "miss-fajardose",
    signatureColor: SIGNATURE_COLORS["warm-ivory-gold"],
  },
  {
    name: "Jason Cyrus",
    role: "Media Head",
    tier: 7,
    photoUrl: "/images/leaders/jason.JPEG",
    signatureFont: "mr-de-haviland",
    signatureColor: SIGNATURE_COLORS["antique-brass"],
  },
];
