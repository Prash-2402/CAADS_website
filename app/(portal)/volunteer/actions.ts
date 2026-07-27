"use server";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";

export async function updateAssignmentStatusAction(
  eventId: string,
  status: "accepted" | "declined"
) {
  const profile = await getProfile();

  if (!profile || !["volunteer", "core_team", "admin"].includes(profile.role)) {
    return { error: "Unauthorized" };
  }

  const supabase = createClient();

  const { error } = await supabase
    .from("volunteer_assignments")
    .update({ status })
    .eq("event_id", eventId)
    .eq("user_id", profile.id);

  if (error) {
    return { error: "Failed to update assignment status." };
  }

  revalidatePath("/volunteer");
  revalidatePath(`/volunteer/events/${eventId}`);
  return { success: true };
}
