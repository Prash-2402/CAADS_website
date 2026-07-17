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
    { name: "Highlights", href: isHome ? "#highlights" : "/#highlights" },
    { name: "Team", href: isHome ? "#team" : "/#team" },
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
            <Link href="/" className="group inline-block">
              <span className="font-display text-lg md:text-xl font-bold text-ivory tracking-tight group-hover:text-gold transition-colors leading-snug">
                Christite Association for Artificial<br />
                Intelligence & Data Science
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
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
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-bg-secondary border-b border-border-gold shadow-lg py-4 px-6 flex flex-col gap-4">
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
        </div>
      )}
    </header>
  );
}
