import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "CAADS",
    template: "%s | CAADS",
  },
};

/**
 * AuthLayout — centered card, no nav bar, no footer.
 * Used by /login and /signup.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12">
      {/* Brand mark */}
      <div className="mb-8 text-center">
        <span className="font-display text-2xl font-bold text-gold tracking-tight">
          CAADS
        </span>
        <p className="font-mono text-xs text-muted mt-1 tracking-widest uppercase">
          AI Thinks &amp; Data Speaks
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-bg-secondary border border-border-gold rounded-2xl p-8 shadow-gold">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-8 font-body text-xs text-muted text-center">
        Christ University AI &amp; Data Science Club
      </p>
    </div>
  );
}
