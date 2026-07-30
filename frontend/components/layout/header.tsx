"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import type { UserRole } from "@/types/database";

type HeaderProps = {
  userRole?: UserRole | null;
};

export function Header({ userRole }: HeaderProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "About", href: isHome ? "#about" : "/#about" },
    { name: "History", href: isHome ? "#history" : "/#history" },
    { name: "Achievements", href: isHome ? "#achievements" : "/#achievements" },
    { name: "Office Bearers", href: isHome ? "#office-bearers" : "/#office-bearers" },
    { name: "Events", href: "/events" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-bg/80 backdrop-blur-md border-b border-border-gold/50 shadow-sm py-4"
          : "bg-transparent py-6"
      )}
    >
      <div className="w-full px-6 md:px-12">
        <div className="flex items-start justify-between">
          
          {/* Left Side: Logo + Nav */}
          <div className="flex flex-col gap-4">
            {/* Logo */}
            <Link href="/" className="group relative inline-flex items-center min-h-[64px]">
              {/* Invisible placeholder to maintain layout size */}
              <span className="font-display text-lg md:text-xl font-bold text-transparent select-none pointer-events-none leading-snug" aria-hidden="true">
                Christite Association for Artificial<br />
                Intelligence & Data Science
              </span>

              {/* CAADS (Visible by default) */}
              <span className="font-display text-4xl md:text-5xl font-black text-ivory tracking-tighter absolute inset-0 flex items-center transition-all duration-500 ease-out group-hover:opacity-0 group-hover:-translate-y-4 group-hover:scale-95 group-hover:blur-sm origin-left">
                CAADS
              </span>

              {/* Full Name (Visible on hover) */}
              <span className="font-display text-lg md:text-xl font-bold text-gold tracking-tight leading-snug absolute inset-0 flex items-center transition-all duration-500 ease-out opacity-0 translate-y-4 scale-105 blur-sm group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:blur-0 origin-left">
                <span>
                  Christite Association for Artificial<br />
                  Intelligence & Data Science
                </span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="font-body text-sm font-medium text-ivory hover:text-gold transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <button
            className="md:hidden p-2 text-ivory"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
          >
            {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <nav
          id="mobile-nav-menu"
          className="md:hidden absolute top-full left-0 right-0 bg-bg-secondary border-b border-border-gold shadow-lg py-4 px-6 flex flex-col gap-4"
          aria-label="Mobile navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="font-body text-base font-medium text-ivory py-2 border-b border-border-gold/30"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
