"use client";

import {
  useRef,
  useState,
  useCallback,
  type MouseEvent,
} from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Crown, Sparkles, ShieldCheck } from "lucide-react";
import { CrestPlaceholder } from "./crest-placeholder";
import { SIGNATURE_FONT_VAR, type Leader } from "@/data/office-bearers";

type Props = {
  leader: Leader;
};

const REVEAL_DURATION_MS = 500;

export function FacilitatorCard({ leader }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-60px" });

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [revealed, setRevealed] = useState(false);
  const revealCount = useRef(0);
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isHovered || revealed;

  const sigFontVar = SIGNATURE_FONT_VAR[leader.signatureFont];

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    const y = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    setTilt({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
    setRevealed(false);
  }, []);

  const handleReveal = useCallback(() => {
    revealCount.current += 1;
    setRevealed((prev) => !prev);
  }, []);

  const revealTiming = `${REVEAL_DURATION_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.94, y: 20 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex flex-col items-center select-none ${isExpanded ? "relative z-50" : "relative z-10"}`}
    >
      {/* Facilitator Crown Header */}
      <div className="flex items-center gap-2 mb-3">
        <Crown size={18} className="text-gold animate-pulse" />
        <span className="font-mono text-xs tracking-[0.25em] font-bold text-gold uppercase">
          Faculty Facilitator
        </span>
        <Crown size={18} className="text-gold animate-pulse" />
      </div>

      {/* ── Badge Wrapper ──────────────────────────────────────────────── */}
      <div
        className="relative flex items-center cursor-pointer outline-none group"
        style={{
          transform: `perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.18s ease-out",
          willChange: "transform",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={handleReveal}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleReveal();
        }}
        role="button"
        tabIndex={0}
        aria-label={`${leader.name}, ${leader.role}`}
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-gold/30 via-gold-bright/20 to-amber-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* ── Medallion (Morphing Photo) ─────────────────────────────── */}
        <div className="relative z-10 flex-shrink-0" style={{ width: 108, height: 108 }}>
          
          {/* Outer Royal Gold Ring */}
          <div
            className={`absolute -inset-1.5 rounded-full bg-gradient-to-tr from-gold-bright via-gold to-amber-200 p-[2px] transition-all duration-500 ${
              isExpanded ? "opacity-0 scale-125" : "opacity-100 scale-100 shadow-[0_0_20px_rgba(201,162,39,0.4)]"
            }`}
          >
            <div className="w-full h-full rounded-full bg-bg" />
          </div>

          {/* Photo Card Container */}
          <div
            className={`absolute border-2 border-gold-bright bg-bg flex items-center justify-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
              isExpanded
                ? "w-[300px] h-[370px] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(201,162,39,0.3)] -top-[131px] -left-[16px]"
                : "w-[108px] h-[108px] rounded-full top-0 left-0"
            }`}
          >
            {leader.photoUrl ? (
              <div className="absolute inset-0">
                <Image
                  src={leader.photoUrl}
                  alt={leader.name}
                  fill
                  className={`object-cover transition-transform duration-700 ease-out ${
                    isExpanded ? "scale-105" : "scale-110"
                  }`}
                  sizes={isExpanded ? "300px" : "108px"}
                  priority
                />
                
                {/* Dark Gradient Overlay when signature is revealed */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-300"
                  style={{ opacity: revealed ? 1 : 0 }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <CrestPlaceholder size={isExpanded ? 150 : 88} />
              </div>
            )}
          </div>

          {/* ── Signature Overlay ────────────────────────────────────── */}
          <div
            className={`absolute pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-20 ${
              isExpanded
                ? "w-[300px] h-[370px] -top-[131px] -left-[16px]"
                : "w-[108px] h-[108px] top-0 left-0"
            }`}
          >
            <div 
              className={`absolute inset-x-0 bottom-8 flex items-center justify-center pointer-events-none transition-opacity duration-300 px-4 ${
                isExpanded ? "opacity-100" : "opacity-0"
              }`}
            >
              <span
                className="absolute flex items-center justify-center px-6"
                style={{
                  fontFamily: `${sigFontVar}, cursive`,
                  fontSize: "2.1rem",
                  lineHeight: 1.1,
                  color: leader.signatureColor,
                  clipPath: revealed ? "inset(-10px -20px -10px -20px)" : "inset(0 100% 0 0)",
                  transition: `clip-path ${revealTiming}`,
                  whiteSpace: "nowrap",
                  textShadow: "0 2px 10px rgba(0,0,0,0.95), 0 0 15px rgba(232,185,62,0.4)",
                  paddingRight: "1.5rem", // Prevent right swash truncation
                }}
                aria-hidden="true"
              >
                {leader.name}
              </span>
            </div>
          </div>
        </div>

        {/* ── Premium Metallic Gold Plaque ────────────────────────────── */}
        <div
          className="relative -ml-5 flex flex-col justify-center border-2 border-gold-bright"
          style={{
            width: 300,
            minHeight: 96,
            paddingLeft: 28,
            paddingRight: 18,
            paddingTop: 12,
            paddingBottom: 12,
            backgroundColor: "#12100C",
            boxShadow:
              "inset 0 0 0 1px #7A5C1E, inset 0 0 0 3px #12100C, inset 0 0 0 5px #C9A22760, 0 10px 30px rgba(0,0,0,0.6)",
            borderRadius: "4px 8px 8px 4px",
          }}
        >
          {/* Top Label & Badge Icon */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-gold-bright font-bold flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-gold-bright flex-shrink-0" />
              {leader.role}
            </span>
            <Sparkles size={13} className="text-gold-bright opacity-90 flex-shrink-0" />
          </div>

          {/* Decorative Divider */}
          <div className="flex items-center gap-1 mb-2">
            <div className="h-px flex-1 bg-gradient-to-r from-gold via-gold-bright to-gold" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold-bright flex-shrink-0 shadow-[0_0_6px_#E8B93E]" />
            <div className="h-px flex-1 bg-gradient-to-r from-gold via-gold-bright to-gold" />
          </div>

          {/* Name - Prominently Displayed */}
          <div className="relative flex items-center py-0.5">
            <span
              className="font-display font-bold uppercase tracking-wider text-ivory text-sm sm:text-base whitespace-nowrap block"
              style={{
                letterSpacing: "0.06em",
                color: "#F2EDE4",
                textShadow: "0 1px 6px rgba(0,0,0,0.9)",
              }}
            >
              {leader.name}
            </span>
          </div>

          {/* Bottom Decorative Separator */}
          <div className="flex items-center gap-1 mt-2 mb-1">
            <div className="h-px flex-1 bg-gold/40" />
            <div className="w-1 h-1 rounded-full bg-gold/60 flex-shrink-0" />
            <div className="h-px flex-1 bg-gold/40" />
          </div>

          {/* Department Footer */}
          <p className="font-mono text-[9.5px] tracking-[0.2em] uppercase text-center text-muted/90 font-medium">
            Department of ADSE • Faculty Advisor
          </p>
        </div>
      </div>
    </motion.div>
  );
}
