import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import VolunteerManager from "./volunteer-manager";

export const metadata = {
  title: "Volunteer Selection - CAADS",
};

export default async function EventVolunteersPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  // Fetch event details
  const { data: event } = await supabase
    .from("events")
    .select("id, title")
    .eq("id", params.id)
    .single();

  if (!event) {
    notFound();
  }

  // Fetch all staff profiles (potential volunteers)
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("role", ["volunteer", "core_team", "admin"]);

  // Fetch assignments for this event
  const { data: assignments } = await supabase
    .from("volunteer_assignments")
    .select(`
      user_id,
      role,
      expected_duration,
      status,
      profiles (
        full_name,
        role
      )
    `)
    .eq("event_id", params.id);

  // Fetch total assignment counts for each volunteer as their activity stat
  const { data: allAssignments } = await supabase
    .from("volunteer_assignments")
    .select("user_id");

  const activityStats = new Map<string, number>();
  allAssignments?.forEach((assign) => {
    activityStats.set(assign.user_id, (activityStats.get(assign.user_id) || 0) + 1);
  });

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/admin/events`} className="text-muted hover:text-ivory transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-ivory">Volunteer Selection</h1>
          <p className="font-body text-muted mt-1">Assign volunteers to &quot;{event.title}&quot;.</p>
        </div>
      </div>

      <VolunteerManager
        eventId={event.id}
        eventTitle={event.title}
        profiles={profiles || []}
        assignments={assignments || []}
        activityStats={Object.fromEntries(activityStats)}
      />
    </div>
  );
}
