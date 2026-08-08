"use client";

import { FACILITATOR, OFFICE_BEARERS } from "@/data/office-bearers";
import { OfficeBearerCard } from "@/components/marketing/office-bearer-card";
import { FacilitatorCard } from "@/components/marketing/facilitator-card";

export function OfficeBearers() {
  return (
    <section
      id="office-bearers"
      className="py-28 bg-bg-secondary border-t border-border-gold/30 relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gold/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-ivory mb-4">
            Faculty Facilitator &amp; Office Bearers
          </h2>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6" />
          <p className="font-body text-muted max-w-xl mx-auto text-sm">
            Guiding the CAADS vision and leading our student community. Hover or tap any badge to inspect and reveal their signature.
          </p>
        </div>

        {/* ── Tier 0: Facilitator (Top Honor — Above All) ──────────────── */}
        <div className="mb-20 flex flex-col items-center">
          <FacilitatorCard leader={FACILITATOR} />
        </div>

        {/* Elegant Section Divider */}
        <div className="flex items-center gap-4 max-w-lg mx-auto mb-16">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-gold/60 to-transparent" />
          <span className="text-[11px] font-mono tracking-[0.25em] text-gold/80 uppercase font-semibold">
            Student Office Bearers
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-gold/60 to-transparent" />
        </div>

        {/* Badges container — single flex-wrap so they sit next to each other */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-12">
          {OFFICE_BEARERS.map((leader, i) => (
            <OfficeBearerCard
              key={leader.name}
              leader={leader}
              index={i}
            />
          ))}
        </div>

        {/* Interaction hint */}
        <p className="text-center font-mono text-xs text-muted/70 mt-16 tracking-widest uppercase">
          Click any badge to reveal their signature
        </p>
      </div>
    </section>
  );
}
