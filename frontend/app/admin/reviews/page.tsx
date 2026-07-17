import { createClient } from "@/lib/supabase/server";
import { LeaderGate } from "@/components/role-gate";
import { format } from "date-fns";
import { Star } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reviews | Admin",
};

export default async function AdminReviewsPage() {
  const supabase = createClient();
  
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      id,
      message,
      rating,
      created_at,
      profiles (
        full_name,
        role
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <LeaderGate>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-ivory">Reviews</h1>
          <p className="font-body text-muted mt-2">View feedback submitted by members.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews?.map((review) => (
            <div key={review.id} className="bg-bg-secondary border border-border-gold rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-display font-semibold text-ivory">
                    {/* @ts-ignore - nested select typings */}
                    {review.profiles?.full_name || "Anonymous"}
                  </h3>
                  <p className="text-xs text-muted">
                    {format(new Date(review.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                {review.rating && (
                  <div className="flex items-center gap-1 bg-gold/10 px-2 py-1 rounded text-gold">
                    <Star size={14} className="fill-gold" />
                    <span className="text-sm font-semibold">{review.rating}</span>
                  </div>
                )}
              </div>
              <p className="font-body text-ivory whitespace-pre-wrap text-sm leading-relaxed">
                {review.message}
              </p>
            </div>
          ))}
          
          {(!reviews || reviews.length === 0) && (
            <div className="col-span-full py-12 text-center border border-dashed border-border-gold rounded-xl">
              <p className="text-muted font-body">No reviews submitted yet.</p>
            </div>
          )}
        </div>
      </div>
    </LeaderGate>
  );
}
