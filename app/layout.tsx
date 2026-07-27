import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// ── Display font: Space Grotesk (headings) ───────────────────
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

// ── Body font: IBM Plex Sans ─────────────────────────────────
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

// ── Utility/mono font: IBM Plex Mono (data, stats) ──────────
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CAADS — AI Thinks & Data Speaks",
    template: "%s | CAADS",
  },
  description:
    "CAADS is a university AI and Data Science club where AI thinks and data speaks. Explore events, join projects, and build with us.",
  keywords: ["AI", "Data Science", "university club", "CAADS", "machine learning"],
  authors: [{ name: "CAADS" }],
  openGraph: {
    title: "CAADS — AI Thinks & Data Speaks",
    description: "University AI and Data Science club platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="antialiased bg-bg text-ivory font-body">
        {children}
      </body>
    </html>
  );
}
