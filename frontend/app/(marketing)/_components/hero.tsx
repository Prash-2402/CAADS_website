"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";

// ── Reduce-motion check ────────────────────────────────────────
function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);
  const strokeRef = useRef<SVGPathElement>(null);
  const dataRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const loginRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Fast-forward on any scroll/touch during sequence
  const skipToEnd = useCallback(() => {
    if (tlRef.current && !tlRef.current.isActive()) return;
    tlRef.current?.seek(tlRef.current.duration());
  }, []);

  useEffect(() => {
    const reduced = prefersReducedMotion();

    if (reduced) {
      // Static final state immediately — no animation
      [aiRef, dataRef, scrollCueRef, loginRef].forEach((ref) => {
        if (ref.current) {
          ref.current.style.opacity = "1";
          ref.current.style.transform = "none";
          ref.current.style.clipPath = "none";
        }
      });
      if (strokeRef.current) {
        strokeRef.current.style.strokeDashoffset = "0";
      }
      return;
    }

    // Measure stroke length for SVG draw animation
    const pathLength = strokeRef.current?.getTotalLength() ?? 800;
    if (strokeRef.current) {
      strokeRef.current.style.strokeDasharray = `${pathLength}`;
      strokeRef.current.style.strokeDashoffset = `${pathLength}`;
    }

    // Set initial hidden states
    gsap.set(dataRef.current, { clipPath: "inset(0 100% 0 0)" });
    gsap.set(scrollCueRef.current, { opacity: 0, y: 8 });
    gsap.set(loginRef.current, { opacity: 0, y: 6 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tlRef.current = tl;

    tl
      // Beat 1: "AI Thinks." — already visible, hold
      .to({}, { duration: 0.9 })

      // Beat 2: Gold stroke draws itself
      .to(
        strokeRef.current,
        {
          strokeDashoffset: 0,
          duration: 0.65,
          ease: "power2.inOut",
        },
        ">"
      )

      // Brief settle after stroke
      .to({}, { duration: 0.2 })

      // Beat 3: "& Data Speaks" revealed left-to-right via clip-path
      .to(
        dataRef.current,
        {
          clipPath: "inset(0 0% 0 0)",
          duration: 0.55,
          ease: "power2.inOut",
        },
        ">"
      )

      // Beat 4: Scroll cue + login buttons appear
      .to(
        scrollCueRef.current,
        { opacity: 1, y: 0, duration: 0.5 },
        ">+0.3"
      )
      .to(loginRef.current, { opacity: 1, y: 0, duration: 0.4 }, "<+0.1");

    // Skip-on-scroll listeners
    window.addEventListener("wheel", skipToEnd, { passive: true, once: true });
    window.addEventListener("touchstart", skipToEnd, {
      passive: true,
      once: true,
    });

    return () => {
      tl.kill();
      window.removeEventListener("wheel", skipToEnd);
      window.removeEventListener("touchstart", skipToEnd);
    };
  }, [skipToEnd]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-bg"
    >
      {/* ── Ambient warm glow — subtle on cream ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[500px] w-[500px] rounded-full bg-gold/8 blur-[140px]" />
      </div>

      {/* ── Hero text lockup ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 select-none">

        {/* Beat 1 — "AI Thinks." always visible */}
        <div ref={aiRef} className="overflow-hidden">
          <h1 className="font-display text-[clamp(3rem,10vw,9rem)] font-bold text-ivory leading-none tracking-tight">
            AI Thinks.
          </h1>
        </div>

        {/* Beat 2 — Gold stroke SVG (full viewport width, centered) */}
        <div
          aria-hidden="true"
          className="pointer-events-none my-3 w-full max-w-2xl"
        >
          <svg
            viewBox="0 0 700 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-6"
            aria-hidden="true"
          >
            <path
              ref={strokeRef}
              d="M 0 12 C 100 2, 200 22, 350 12 C 500 2, 600 22, 700 12"
              stroke="#C9A227"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Beat 3 — "& Data Speaks" clip-path revealed L→R */}
        <div
          ref={dataRef}
          style={{ clipPath: "inset(0 100% 0 0)" }}
          className="overflow-visible"
        >
          <p className="font-display text-[clamp(2rem,7vw,6.5rem)] font-bold text-ivory leading-none tracking-tight">
            & Data Speaks.
          </p>
        </div>

        {/* Beat 4 — Scroll cue */}
        <div
          ref={scrollCueRef}
          aria-label="Scroll to explore"
          className="mt-12 flex flex-col items-center gap-2"
          style={{ opacity: 0 }}
        >
          <span className="font-mono text-xs text-muted tracking-[0.3em] uppercase">
            Scroll
          </span>
          <div className="flex flex-col items-center gap-1">
            <span
              aria-hidden="true"
              className="block w-px h-6 bg-gradient-to-b from-gold/60 to-transparent animate-pulse"
            />
          </div>
        </div>
      </div>

      {/* ── Login buttons — Beat 4, top-right ── */}
      <div
        ref={loginRef}
        className="absolute top-28 right-6 md:right-12 flex flex-col gap-2.5 items-end z-20"
        style={{ opacity: 0 }}
      >
        <Link
          href="/login?role=student"
          className="w-44 px-5 py-2 rounded-lg bg-bg border border-border-gold/50 text-ivory text-sm font-semibold hover:bg-gold/10 hover:border-gold transition-colors text-center"
        >
          Student Login
        </Link>
        <Link
          href="/login?role=volunteer"
          className="w-44 px-5 py-2 rounded-lg bg-bg border border-border-gold/50 text-ivory text-sm font-semibold hover:bg-gold/10 hover:border-gold transition-colors text-center"
        >
          Volunteer Login
        </Link>
        <Link
          href="/login?role=leader"
          className="w-44 px-5 py-2 rounded-lg bg-gold text-bg text-sm font-bold hover:bg-gold-bright transition-colors text-center"
        >
          Leader Login
        </Link>
      </div>
    </section>
  );
}
