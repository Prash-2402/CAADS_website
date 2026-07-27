import Link from "next/link";
import { marketingData } from "@/data/marketing";

export function Hero() {
  const { title } = marketingData.hero; // We only need the core title for this design

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-bg">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[100px] pointer-events-none z-0" />
      
      {/* Centered Hero Text */}
      <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center justify-center">
        <h1 className="font-display text-[8rem] md:text-[10rem] lg:text-[12rem] font-bold text-ivory tracking-tight leading-none mb-0 animate-fade-in-up">
          CAADS
        </h1>
        <h2 className="font-mono text-xl md:text-3xl text-gold tracking-[0.2em] uppercase mt-2 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          AI Thinks &amp; Data Speaks
        </h2>
      </div>

      {/* Top Right Login Buttons */}
      <div className="absolute top-32 right-8 md:right-16 flex flex-col gap-3 items-end z-20 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <Link
          href="/login?role=student"
          className="w-48 px-6 py-2.5 rounded-lg bg-bg border border-border-gold/50 text-ivory text-sm font-semibold hover:bg-gold/10 hover:border-gold transition-colors text-center shadow-lg"
        >
          Student Login
        </Link>
        <Link
          href="/login?role=volunteer"
          className="w-48 px-6 py-2.5 rounded-lg bg-bg border border-border-gold/50 text-ivory text-sm font-semibold hover:bg-gold/10 hover:border-gold transition-colors text-center shadow-lg"
        >
          Volunteer Login
        </Link>
        <Link
          href="/login?role=leader"
          className="w-48 px-6 py-2.5 rounded-lg bg-gold text-bg text-sm font-bold hover:bg-gold-bright transition-colors text-center shadow-lg shadow-gold/20"
        >
          Leader Login
        </Link>
      </div>
    </section>
  );
}
