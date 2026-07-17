import Link from "next/link";
import { marketingData } from "@/data/marketing";
import { ArrowRight } from "lucide-react";

export function Hero() {
  const { title, subtitle, description, primaryCta, secondaryCta } = marketingData.hero;

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-bg z-0" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[120px] pointer-events-none z-0" />
      
      <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
        <h2 className="font-mono text-sm md:text-base text-gold tracking-widest uppercase mb-6 animate-fade-in-up">
          {subtitle}
        </h2>
        
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-ivory tracking-tight mb-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <span className="block">{title.split("&")[0]}</span>
          <span className="block text-gold">&amp; {title.split("&")[1]}</span>
        </h1>
        
        <p className="font-body text-lg md:text-xl text-muted mb-12 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          {description}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <Link
            href="/events"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gold text-bg font-semibold hover:bg-gold-bright transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            {primaryCta}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-transparent border border-gold text-ivory font-semibold hover:bg-gold/10 transition-colors duration-300 flex items-center justify-center"
          >
            {secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
