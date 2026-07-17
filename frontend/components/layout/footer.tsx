import Link from "next/link";
import { Code, Camera, Briefcase, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-border-gold/50 py-12">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Intro */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-display text-2xl font-bold text-ivory tracking-tight">
                CAADS
              </span>
            </Link>
            <p className="font-body text-sm text-muted max-w-sm">
              Christ University AI &amp; Data Science Club. We are a community of students
              passionate about artificial intelligence, machine learning, and data analytics.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold text-ivory mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/events" className="font-body text-sm text-muted hover:text-gold transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/#about" className="font-body text-sm text-muted hover:text-gold transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#team" className="font-body text-sm text-muted hover:text-gold transition-colors">
                  Team
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-display text-lg font-semibold text-ivory mb-4">Connect</h3>
            <div className="flex gap-4">
              <a href="#" className="text-muted hover:text-gold transition-colors" aria-label="Instagram">
                <Camera size={20} />
              </a>
              <a href="#" className="text-muted hover:text-gold transition-colors" aria-label="LinkedIn">
                <Briefcase size={20} />
              </a>
              <a href="#" className="text-muted hover:text-gold transition-colors" aria-label="GitHub">
                <Code size={20} />
              </a>
              <a href="mailto:contact@christuniversity.in" className="text-muted hover:text-gold transition-colors" aria-label="Email">
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border-gold/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-muted">
            &copy; {new Date().getFullYear()} CAADS Christ University. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="font-mono text-xs text-muted hover:text-ivory transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="font-mono text-xs text-muted hover:text-ivory transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
