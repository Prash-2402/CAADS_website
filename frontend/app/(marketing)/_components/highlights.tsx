import { marketingData } from "@/data/marketing";

export function Highlights() {
  const { highlights } = marketingData;

  return (
    <section id="highlights" className="py-24 bg-bg border-y border-border-gold/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-ivory mb-4">
            Our Impact
          </h2>
          <div className="w-16 h-1 bg-gold mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((item, i) => (
            <div 
              key={i}
              className="p-8 rounded-2xl bg-bg-secondary border border-border-gold shadow-gold hover:-translate-y-2 transition-transform duration-300 group"
            >
              <h3 className="font-mono text-5xl font-bold text-gold mb-4 group-hover:text-gold-bright transition-colors">
                {item.value}
              </h3>
              <h4 className="font-display text-xl font-semibold text-ivory mb-2">
                {item.label}
              </h4>
              <p className="font-body text-sm text-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
