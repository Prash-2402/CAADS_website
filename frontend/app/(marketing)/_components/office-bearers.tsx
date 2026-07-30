"use client";

import { OFFICE_BEARERS } from "@/data/office-bearers";
import { OfficeBearerCard } from "@/components/marketing/office-bearer-card";

export function OfficeBearers() {
  return (
    <section
      id="office-bearers"
      className="py-28 bg-bg-secondary border-t border-border-gold/30"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-ivory mb-4">
            Office Bearers
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mb-6 rounded-full" />
          <p className="font-body text-muted max-w-xl mx-auto text-sm">
            The people behind the club. Hover over a badge to reveal their
            photo — click or tap to see their signature.
          </p>
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
