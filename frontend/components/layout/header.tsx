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

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Define nav links. If on home page, use anchor links for sections.
  const navLinks = [
    { name: "About", href: isHome ? "#about" : "/#about" },
    { name: "Highlights", href: isHome ? "#highlights" : "/#highlights" },
    { name: "Team", href: isHome ? "#team" : "/#team" },
    { name: "Events", href: "/events" },
  ];

  const renderAuthButton = () => {
    if (!userRole) {
      return (
        <Link
          href="/login"
          className="px-4 py-2 rounded-xl bg-gold text-bg font-semibold hover:bg-gold-bright transition-colors"
        >
          Sign In
        </Link>
      );
    }

    if (userRole === "admin" || userRole === "core_team") {
      return (
        <Link
          href="/admin"
          className="px-4 py-2 rounded-xl bg-bg-secondary border border-gold text-ivory font-semibold hover:bg-gold/10 transition-colors"
        >
          Admin Portal
        </Link>
      );
    }

    if (userRole === "volunteer") {
      return (
        <Link
          href="/volunteer"
          className="px-4 py-2 rounded-xl bg-bg-secondary border border-gold text-ivory font-semibold hover:bg-gold/10 transition-colors"
        >
          Volunteer Portal
        </Link>
      );
    }

    // Default student
    return (
      <Link
        href="/dashboard"
        className="px-4 py-2 rounded-xl bg-bg-secondary border border-gold text-ivory font-semibold hover:bg-gold/10 transition-colors"
      >
        Dashboard
      </Link>
    );
  };

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-bg/80 backdrop-blur-md border-b border-border-gold/50 shadow-sm py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-display text-2xl font-bold text-ivory tracking-tight group-hover:text-gold transition-colors">
              CAADS
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-body text-sm font-medium text-muted hover:text-ivory transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {renderAuthButton()}
          </div>

          {/* Mobile Menu Toggle */}
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
          <div className="pt-2">{renderAuthButton()}</div>
        </div>
      )}
    </header>
  );
}
