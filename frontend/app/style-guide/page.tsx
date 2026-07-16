/**
 * /style-guide — Internal-only visual reference route.
 * NOT linked in any navigation. Gate or delete before launch.
 *
 * Shows: color swatches, type scale, button states, card states.
 * Used as a living reference while building every feature after this.
 */

export const metadata = {
  title: "Style Guide | CAADS (Internal)",
  robots: "noindex, nofollow",
};

// ── Token data ────────────────────────────────────────────────
const colorTokens = [
  { name: "--bg", label: "Background", hex: "#0A0A0A", tw: "bg-bg" },
  { name: "--bg-secondary", label: "Background Secondary", hex: "#151515", tw: "bg-bg-secondary" },
  { name: "--gold", label: "Gold (Primary Accent)", hex: "#C9A227", tw: "bg-gold" },
  { name: "--gold-bright", label: "Gold Bright (Hover)", hex: "#E8B93E", tw: "bg-gold-bright" },
  { name: "--ivory", label: "Ivory (Primary Text)", hex: "#F2EDE4", tw: "bg-ivory" },
  { name: "--muted", label: "Muted (Secondary Text)", hex: "#B8B2A7", tw: "bg-muted" },
  { name: "--border-gold", label: "Border Gold", hex: "#7A5C1E", tw: "bg-border-gold" },
] as const;

// ── Swatch ────────────────────────────────────────────────────
function Swatch({
  token,
}: {
  token: (typeof colorTokens)[number];
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-16 w-full rounded-xl border border-white/10"
        style={{ backgroundColor: token.hex }}
      />
      <div>
        <p className="font-mono text-xs text-muted">{token.name}</p>
        <p className="text-sm font-medium text-ivory">{token.label}</p>
        <p className="font-mono text-xs text-muted">{token.hex}</p>
        <p className="font-mono text-xs text-muted">{token.tw}</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function StyleGuidePage() {
  return (
    <main className="min-h-screen bg-bg px-8 py-12 max-w-5xl mx-auto space-y-20">
      {/* Header */}
      <div className="border-b border-border-gold pb-8">
        <p className="font-mono text-xs text-gold mb-2 uppercase tracking-widest">
          Internal — Not for public
        </p>
        <h1 className="font-display text-5xl font-bold text-ivory">
          CAADS Style Guide
        </h1>
        <p className="mt-3 text-muted font-body text-lg">
          Design token reference. Delete or gate before launch.
        </p>
      </div>

      {/* ── 1. Color Tokens ─────────────────────────────────── */}
      <section>
        <h2 className="font-display text-2xl font-semibold text-ivory mb-6 pb-3 border-b border-border-gold">
          1. Color Tokens
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {colorTokens.map((t) => (
            <Swatch key={t.name} token={t} />
          ))}
        </div>
      </section>

      {/* ── 2. Type Scale ───────────────────────────────────── */}
      <section>
        <h2 className="font-display text-2xl font-semibold text-ivory mb-6 pb-3 border-b border-border-gold">
          2. Type Scale
        </h2>
        <div className="space-y-6">
          <div>
            <p className="font-mono text-xs text-muted mb-1">font-display / 5xl / bold — Space Grotesk</p>
            <h1 className="font-display text-5xl font-bold text-ivory">
              AI Thinks &amp; Data Speaks
            </h1>
          </div>
          <div>
            <p className="font-mono text-xs text-muted mb-1">font-display / 4xl / semibold</p>
            <h2 className="font-display text-4xl font-semibold text-ivory">
              Heading Two
            </h2>
          </div>
          <div>
            <p className="font-mono text-xs text-muted mb-1">font-display / 3xl / semibold</p>
            <h3 className="font-display text-3xl font-semibold text-ivory">
              Heading Three
            </h3>
          </div>
          <div>
            <p className="font-mono text-xs text-muted mb-1">font-display / 2xl / medium</p>
            <h4 className="font-display text-2xl font-medium text-ivory">
              Heading Four
            </h4>
          </div>
          <div>
            <p className="font-mono text-xs text-muted mb-1">font-body / base / normal — IBM Plex Sans</p>
            <p className="font-body text-base text-ivory">
              Body text. CAADS is a university AI and Data Science club. We build
              real products, run events, and grow together.
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-muted mb-1">font-body / base / normal — muted variant</p>
            <p className="font-body text-base text-muted">
              Secondary / supporting text. Used for descriptions, helper copy,
              timestamps, and labels.
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-muted mb-1">font-mono / sm — IBM Plex Mono — data/stats</p>
            <p className="font-mono text-sm text-ivory">
              142 attendees · 38 volunteers · 12 events
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-muted mb-1">text-gold-gradient utility</p>
            <h3 className="font-display text-3xl font-bold text-gold-gradient">
              Gold Gradient Text
            </h3>
          </div>
        </div>
      </section>

      {/* ── 3. Button States ────────────────────────────────── */}
      <section>
        <h2 className="font-display text-2xl font-semibold text-ivory mb-6 pb-3 border-b border-border-gold">
          3. Button States
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          {/* Primary */}
          <button
            className="
              px-6 py-2.5 rounded-xl font-body font-semibold text-sm
              bg-gold text-bg
              hover:bg-gold-bright
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-bg
            "
          >
            Primary
          </button>

          {/* Primary hover simulation */}
          <button
            className="
              px-6 py-2.5 rounded-xl font-body font-semibold text-sm
              bg-gold-bright text-bg
              transition-colors duration-200
            "
          >
            Primary (Hover)
          </button>

          {/* Secondary */}
          <button
            className="
              px-6 py-2.5 rounded-xl font-body font-semibold text-sm
              border border-border-gold text-ivory bg-transparent
              hover:border-gold hover:text-gold
              transition-colors duration-200
            "
          >
            Secondary
          </button>

          {/* Ghost */}
          <button
            className="
              px-6 py-2.5 rounded-xl font-body font-semibold text-sm
              text-muted bg-transparent
              hover:text-ivory
              transition-colors duration-200
            "
          >
            Ghost
          </button>

          {/* Destructive */}
          <button
            className="
              px-6 py-2.5 rounded-xl font-body font-semibold text-sm
              border border-red-800 text-red-400 bg-transparent
              hover:border-red-600 hover:text-red-300
              transition-colors duration-200
            "
          >
            Destructive
          </button>

          {/* Disabled */}
          <button
            disabled
            className="
              px-6 py-2.5 rounded-xl font-body font-semibold text-sm
              bg-bg-secondary text-muted cursor-not-allowed
              border border-border-gold/30
            "
          >
            Disabled
          </button>
        </div>
      </section>

      {/* ── 4. Card States ──────────────────────────────────── */}
      <section>
        <h2 className="font-display text-2xl font-semibold text-ivory mb-6 pb-3 border-b border-border-gold">
          4. Card States
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Default card */}
          <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 space-y-2">
            <p className="font-mono text-xs text-gold uppercase tracking-widest">Default</p>
            <h3 className="font-display text-lg font-semibold text-ivory">Event Card</h3>
            <p className="font-body text-sm text-muted">
              Standard card with bg-secondary and border-gold.
            </p>
          </div>

          {/* Hover / active card */}
          <div className="bg-bg-secondary border border-gold rounded-2xl p-6 space-y-2 shadow-gold">
            <p className="font-mono text-xs text-gold uppercase tracking-widest">Hover / Focus</p>
            <h3 className="font-display text-lg font-semibold text-ivory">Event Card</h3>
            <p className="font-body text-sm text-muted">
              Border upgrades to gold, shadow-gold applied.
            </p>
          </div>

          {/* Glass card */}
          <div className="glass rounded-2xl p-6 space-y-2">
            <p className="font-mono text-xs text-gold uppercase tracking-widest">Glass</p>
            <h3 className="font-display text-lg font-semibold text-ivory">Glass Card</h3>
            <p className="font-body text-sm text-muted">
              Frosted glass effect for overlays and hero sections.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Data / Stat Display ──────────────────────────── */}
      <section>
        <h2 className="font-display text-2xl font-semibold text-ivory mb-6 pb-3 border-b border-border-gold">
          5. Data &amp; Stat Display
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { value: "142", label: "Attendees" },
            { value: "38", label: "Volunteers" },
            { value: "12", label: "Events" },
            { value: "6", label: "Core Team" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-bg-secondary border border-border-gold rounded-2xl p-6 text-center"
            >
              <p className="font-mono text-4xl font-semibold text-gold-gradient">
                {stat.value}
              </p>
              <p className="font-body text-sm text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <footer className="border-t border-border-gold pt-8">
        <p className="font-mono text-xs text-muted">
          This route ({" "}
          <span className="text-gold">/style-guide</span>) is internal only.
          Gate with a leader role check or delete before production launch.
        </p>
      </footer>
    </main>
  );
}
