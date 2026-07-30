"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type MouseEvent,
} from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { CrestPlaceholder } from "./crest-placeholder";
import { SIGNATURE_FONT_VAR, type Leader } from "@/data/office-bearers";

type Props = {
  leader: Leader;
  index: number; // stagger delay
};

// ── Reduced motion helper ──────────────────────────────────────────────────
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// ── Touch device detection ─────────────────────────────────────────────────
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);
  return isTouch;
}

// ── Animation duration (ms) for the reveal — keep dot and clip-path in sync ─
const REVEAL_DURATION_MS = 480;

export function OfficeBearerCard({ leader, index }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();
  const isTouch = useIsTouchDevice();

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  // revealed: false = printed name visible, true = signature revealed
  const [revealed, setRevealed] = useState(false);
  // revealCount: incremented on every toggle so the pen-dot element remounts
  // and its CSS keyframe animation always fires from the beginning.
  const revealCount = useRef(0);
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isHovered || revealed;

  // Resolve font CSS variable for this leader's assigned signature font
  const sigFontVar = SIGNATURE_FONT_VAR[leader.signatureFont];

  // ── 3D tilt on mouse move (desktop only) ──────────────────────────────
  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (isTouch || reduced) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
      const y = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
      setTilt({ x, y });
    },
    [isTouch, reduced]
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
    setRevealed(false); // Automatically revert the signature state when moving away
  }, []);

  // ── Signature reveal: toggle on click (desktop) or tap (mobile) ───────
  // Single handler used for both — onClick fires on desktop,
  // onTouchEnd fires on mobile and we call preventDefault() to suppress
  // the subsequent synthetic click event that mobile browsers fire after touch.
  const handleReveal = useCallback(() => {
    revealCount.current += 1;
    setRevealed((prev) => !prev);
  }, []);

  // Card scroll-in animation
  const cardVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduced ? 0 : 0.48,
        delay: reduced ? 0 : index * 0.07,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      },
    },
  };

  // CSS timing string that matches REVEAL_DURATION_MS
  const revealTiming = `${REVEAL_DURATION_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={`flex flex-col items-center select-none ${isExpanded ? "relative z-50" : "relative z-10"}`}
    >
      {/* ── Full badge wrapper — click/tap target ──────────────────────── */}
      <div
        className="relative flex items-center cursor-pointer outline-none"
        style={{
          // Only apply perspective and tilt on non-touch, non-reduced-motion
          transform:
            !reduced && !isTouch
              ? `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
              : undefined,
          transition: !reduced && !isTouch ? "transform 0.15s ease-out" : undefined,
          willChange: !reduced && !isTouch ? "transform" : undefined,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        // Desktop: plain click
        onClick={handleReveal}
        // Mobile: use onTouchEnd + preventDefault to suppress the follow-up
        // synthetic click that would double-toggle the state
        onTouchEnd={(e) => {
          e.preventDefault();
          handleReveal();
        }}
        role="button"
        tabIndex={0}
        aria-label={`${leader.name}, ${leader.role} — ${revealed ? "tap to hide" : "tap to reveal"} signature`}
        aria-pressed={revealed}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleReveal();
          }
        }}
      >
        {/* ── Medallion (Morphs into Portrait Card) ─────────────────── */}
        <div className="relative z-10 flex-shrink-0" style={{ width: 92, height: 92 }}>
          
          {/* 1) The morphing card for the Photo (has overflow-hidden) */}
          <div
            className={`absolute border-2 border-gold bg-bg flex items-center justify-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
              isExpanded
                ? "w-[260px] h-[340px] rounded-xl shadow-2xl -top-[124px] -left-[16px]"
                : "w-[92px] h-[92px] rounded-full top-0 left-0"
            }`}
          >
            {leader.photoUrl ? (
              <div className="absolute inset-0">
                <Image
                  src={leader.photoUrl}
                  alt={leader.name}
                  fill
                  className={`object-cover transition-transform duration-700 ease-out ${
                    isExpanded 
                      ? (leader.name === "Jason Cyrus" ? "scale-[1.15]" : "scale-100") 
                      : (leader.name === "Jason Cyrus" ? "scale-[1.3]" : "scale-110")
                  }`}
                  sizes={isExpanded ? "260px" : "92px"}
                />
                
                {/* Dark overlay when signature is revealed for better contrast */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300"
                  style={{ opacity: revealed ? 1 : 0 }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <CrestPlaceholder size={isExpanded ? 140 : 76} />
              </div>
            )}
          </div>

          {/* 2) The Signature Overlay (Tracks the exact same size/position, but NO overflow-hidden) */}
          <div
            className={`absolute pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-20 ${
              isExpanded
                ? "w-[260px] h-[340px] -top-[124px] -left-[16px]"
                : "w-[92px] h-[92px] top-0 left-0"
            }`}
          >
            <div 
              className={`absolute inset-x-0 bottom-8 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
                isExpanded ? "opacity-100" : "opacity-0"
              }`}
            >
              <span
                className="absolute flex items-center justify-center"
                style={{
                  fontFamily: `${sigFontVar}, cursive`,
                  fontSize: "2.4rem",
                  lineHeight: 1,
                  color: leader.signatureColor,
                  clipPath: revealed ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
                  transition: reduced ? "none" : `clip-path ${revealTiming}`,
                  whiteSpace: "nowrap",
                  textShadow: "0 2px 8px rgba(0,0,0,0.9)", // Strong shadow for portrait readability
                }}
                aria-hidden="true"
              >
                {leader.name}
              </span>

              {/* Pen-tip dot over the photo */}
              {!reduced && (
                <span
                  key={revealCount.current}
                  aria-hidden="true"
                  className={revealed ? "pen-dot-traveling" : "pen-dot-idle"}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    transform: "translate(-50%, -50%)",
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    backgroundColor: leader.signatureColor,
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Gold plaque (right side, overlaps medallion edge) ─────────── */}
        <div
          className="relative -ml-4 flex flex-col justify-center border border-gold"
          style={{
            width: 260,
            minHeight: 80,
            paddingLeft: 22,
            paddingRight: 14,
            paddingTop: 10,
            paddingBottom: 10,
            backgroundColor: "#0F0E0C",
            boxShadow: "inset 0 0 0 1px #7A5C1E, inset 0 0 0 3px #0F0E0C, inset 0 0 0 4px #7A5C1E40",
            borderRadius: "2px 4px 4px 2px",
          }}
        >
          {/* Role */}
          <p
            className="font-body text-[11px] italic text-gold tracking-wide mb-1 leading-tight"
            style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {leader.role}
          </p>

          <div className="flex items-center gap-1 mb-1.5">
            <div className="h-px flex-1 bg-gold/50" />
            <div className="w-1 h-1 rounded-full bg-gold/70 flex-shrink-0" />
            <div className="h-px flex-1 bg-gold/50" />
          </div>

          {/* ── Name zone: just printed name now ──────── */}
          <div className="relative" style={{ height: 44 }}>
            <span
              className="font-display font-semibold uppercase tracking-wide absolute inset-0 flex items-center"
              style={{
                fontSize: "0.78rem",
                letterSpacing: "0.06em",
                lineHeight: 1.25,
                color: "#F2EDE4",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {leader.name}
            </span>
          </div>

          {/* Decorative separator (bottom) */}
          <div className="flex items-center gap-1 mt-1.5 mb-1">
            <div className="h-px flex-1 bg-gold/50" />
            <div className="w-1 h-1 rounded-full bg-gold/70 flex-shrink-0" />
            <div className="h-px flex-1 bg-gold/50" />
          </div>

          {/* Department footer — explicit light color since plaque is always dark */}
          <p
            className="font-mono text-[8.5px] tracking-[0.18em] uppercase text-center leading-none"
            style={{ color: "#9A8E7A" }}
          >
            Department of ADSE
          </p>
        </div>
      </div>
    </motion.div>
  );
}
