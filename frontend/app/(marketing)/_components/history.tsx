"use client";

// History section — content TBD (per spec §5, explicitly deferred)
// Stub maintains correct scroll position and nav anchor.
// Replace inner content when copy/design is ready.
export function History() {
  return (
    <section
      id="history"
      className="py-24 bg-bg-secondary border-y border-border-gold/20"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center">
          <h2 className="font-display text-4xl font-bold text-ivory mb-4">
            Our History
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mb-12 rounded-full" />
          <p className="font-body text-muted max-w-2xl mx-auto">
            The story of how CAADS came to be — coming soon.
          </p>
        </div>
      </div>
    </section>
  );
}
