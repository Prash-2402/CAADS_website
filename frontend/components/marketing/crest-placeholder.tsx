// Crest placeholder SVG — modeled on the physical CAADS printed badge.
// The medallion intentionally has a dark (#0A0A0A) background — matching
// the actual printed badge which is a dark circular medallion.
// This contrast (dark crest on cream page) is the correct adaptation.
// Replace with <Image> when real photography is available.

export function CrestPlaceholder({ size = 160 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CAADS crest"
      role="img"
    >
      {/* ── Outer ring ─────────────────────────────────── */}
      <circle cx="100" cy="100" r="97" fill="#0A0A0A" />
      <circle cx="100" cy="100" r="97" stroke="#C9A227" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="92" stroke="#7A5C1E" strokeWidth="0.8" />

      {/* ── Laurel wreath — left side ────────────────── */}
      {/* Each leaf is a small oval, rotated around the circle at ~230°–280° and mirrored */}
      {[0, 12, 24, 36, 48, 60, 72].map((deg) => {
        const angle = (200 + deg) * (Math.PI / 180);
        const r = 82;
        const cx = 100 + r * Math.cos(angle);
        const cy = 100 + r * Math.sin(angle);
        const rotateDeg = 200 + deg + 90;
        return (
          <ellipse
            key={`ll-${deg}`}
            cx={cx}
            cy={cy}
            rx="5"
            ry="9"
            fill="#C9A227"
            opacity="0.85"
            transform={`rotate(${rotateDeg} ${cx} ${cy})`}
          />
        );
      })}

      {/* ── Laurel wreath — right side (mirrored) ────── */}
      {[0, 12, 24, 36, 48, 60, 72].map((deg) => {
        const angle = (340 - deg) * (Math.PI / 180);
        const r = 82;
        const cx = 100 + r * Math.cos(angle);
        const cy = 100 + r * Math.sin(angle);
        const rotateDeg = 340 - deg - 90;
        return (
          <ellipse
            key={`rl-${deg}`}
            cx={cx}
            cy={cy}
            rx="5"
            ry="9"
            fill="#C9A227"
            opacity="0.85"
            transform={`rotate(${rotateDeg} ${cx} ${cy})`}
          />
        );
      })}

      {/* ── Inner circle ──────────────────────────────── */}
      <circle cx="100" cy="100" r="66" fill="#0A0A0A" />
      <circle cx="100" cy="100" r="66" stroke="#C9A227" strokeWidth="1" />

      {/* ── CAADS text ────────────────────────────────── */}
      <text
        x="100"
        y="107"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--font-space-grotesk), sans-serif"
        fontWeight="700"
        fontSize="26"
        letterSpacing="2"
        fill="#C9A227"
      >
        CAADS
      </text>

      {/* ── Bottom star ───────────────────────────────── */}
      {/* Five-point star at ~160° position */}
      <polygon
        points="100,162 102.4,169 109.5,169 103.9,173.5 106.2,180.5 100,176.2 93.8,180.5 96.1,173.5 90.5,169 97.6,169"
        fill="#C9A227"
        opacity="0.9"
      />

      {/* ── Small decorative dots at wreath tips ─────── */}
      <circle cx="62" cy="155" r="2.5" fill="#C9A227" opacity="0.7" />
      <circle cx="138" cy="155" r="2.5" fill="#C9A227" opacity="0.7" />
    </svg>
  );
}
