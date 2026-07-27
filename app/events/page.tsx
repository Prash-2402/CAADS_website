import { createClient } from "@/lib/supabase/server";
import { CalendarView } from "./_components/calendar-view";
import type { EventPublic } from "@/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events Calendar",
  description: "View upcoming events, workshops, and seminars hosted by CAADS.",
};

export const revalidate = 60; // Revalidate public events every 60 seconds

export default async function EventsPage() {
  const supabase = createClient();
  
  // Fetch all public events. 
  // We use events_public to ensure budget/requirements are never returned.
  const { data: events, error } = await supabase
    .from("events_public")
    .select("*")
    .eq("is_public", true)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching public events:", error);
  }

  return (
    <div className="min-h-screen bg-bg pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-ivory mb-4">
            Events Calendar
          </h1>
          <p className="font-body text-lg text-muted max-w-2xl">
            Discover upcoming workshops, seminars, and community meetups. 
            Click on any date with a gold marker to see event details.
          </p>
        </div>

        <div className="bg-bg-secondary rounded-2xl border border-border-gold shadow-gold overflow-hidden">
          <CalendarView events={(events as EventPublic[]) || []} />
        </div>
      </div>
    </div>
  );
}
