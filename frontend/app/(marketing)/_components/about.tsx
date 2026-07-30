import { marketingData } from "@/data/marketing";
import { BrainCircuit, Target, CheckCircle2, Award } from "lucide-react";

export function About() {
  const { title, inauguration, mission, vision, objectives } = marketingData.about;

  return (
    <section id="about" className="py-24 bg-bg-secondary relative">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Top Section: Inauguration & Vision */}
        <div className="mb-20 max-w-4xl">
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-ivory mb-6">
                {title}
              </h2>
              <p className="font-body text-lg text-muted leading-relaxed">
                {inauguration}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-bg border border-border-gold shadow-[0_4px_30px_rgba(201,162,39,0.05)]">
              <div className="flex gap-4">
                <div className="mt-1 flex-shrink-0 w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center border border-gold/30">
                  <BrainCircuit className="text-gold" size={24} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-ivory mb-2">Our Vision</h3>
                  <p className="font-body text-muted leading-relaxed">{vision}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Mission & Objectives */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Mission */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <Target className="text-gold" size={32} />
              <h3 className="font-display text-3xl font-bold text-ivory">Our Mission</h3>
            </div>
            <ul className="space-y-4">
              {mission.map((item, idx) => (
                <li key={idx} className="flex gap-4 items-start group">
                  <CheckCircle2 className="text-gold mt-1 flex-shrink-0 transition-transform group-hover:scale-110" size={20} />
                  <span className="font-body text-muted leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Objectives */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <Award className="text-gold" size={32} />
              <h3 className="font-display text-3xl font-bold text-ivory">Objectives</h3>
            </div>
            <ul className="space-y-4">
              {objectives.map((item, idx) => (
                <li key={idx} className="flex gap-4 items-start group">
                  <div className="w-6 h-6 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] text-gold font-bold">{idx + 1}</span>
                  </div>
                  <span className="font-body text-muted leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
