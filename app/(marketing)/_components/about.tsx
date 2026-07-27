import { marketingData } from "@/data/marketing";
import { BrainCircuit, Target } from "lucide-react";

export function About() {
  const { title, description, mission, vision } = marketingData.about;

  return (
    <section id="about" className="py-24 bg-bg-secondary relative">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-ivory mb-6">
                {title}
              </h2>
              <p className="font-body text-lg text-muted leading-relaxed">
                {description}
              </p>
            </div>

            <div className="space-y-6 pt-6 border-t border-border-gold/30">
              <div className="flex gap-4">
                <div className="mt-1 flex-shrink-0 w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center border border-gold/30">
                  <Target className="text-gold" size={24} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-ivory mb-2">Our Mission</h3>
                  <p className="font-body text-muted">{mission}</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="mt-1 flex-shrink-0 w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center border border-gold/30">
                  <BrainCircuit className="text-gold" size={24} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-ivory mb-2">Our Vision</h3>
                  <p className="font-body text-muted">{vision}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Side */}
          <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square rounded-2xl overflow-hidden border border-border-gold shadow-gold group">
            {/* Dark overlay & placeholder gradient since we don't have real images yet */}
            <div className="absolute inset-0 bg-gradient-to-br from-bg to-bg-secondary z-10 opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
            
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-gold/30 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-2 border-gold border-dashed animate-[spin_10s_linear_infinite]" />
                <span className="font-display font-bold text-2xl text-gold">CAADS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
