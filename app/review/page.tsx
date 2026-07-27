import { AuthGate } from "@/components/role-gate";
import { PublicLayout } from "@/components/layout/public-layout";
import { ReviewForm } from "./_components/review-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a Review",
  description: "Share your feedback about CAADS events and initiatives.",
};

export default function ReviewPage() {
  return (
    <AuthGate>
      <PublicLayout>
        <div className="min-h-screen bg-bg pt-32 pb-24">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="mb-12 text-center">
              <h1 className="font-display text-4xl font-bold text-ivory mb-4">
                Share Your Feedback
              </h1>
              <p className="font-body text-lg text-muted">
                Your feedback helps us improve CAADS. Let us know what you think 
                about our recent events, workshops, or the club in general.
              </p>
            </div>

            <div className="bg-bg-secondary rounded-2xl border border-border-gold shadow-gold p-8 md:p-10">
              <ReviewForm />
            </div>
          </div>
        </div>
      </PublicLayout>
    </AuthGate>
  );
}
