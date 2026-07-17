"use server";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function registerForEventAction(
  eventId: string,
  _prevState: ActionState,
  _formData: FormData
): Promise<ActionState> {
  const profile = await getProfile();

  if (!profile) {
    return { error: "You must be logged in to register." };
  }

  const supabase = createClient();

  // Check if event exists and is public
  const { data: event, error: eventError } = await supabase
    .from("events_public")
    .select("id, title")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return { error: "Event not found or not open for registration." };
  }

  // Insert registration
  const { error } = await supabase
    .from("event_registrations")
    .insert({
      event_id: eventId,
      user_id: profile.id,
    });

  if (error) {
    // Check for unique constraint violation (user already registered)
    if (error.code === "23505") {
      return { error: "You are already registered for this event." };
    }
    return { error: "Failed to register. Please try again." };
  }

  // Send registration confirmation email
  try {
    const { getUserEmail, sendRegistrationConfirmEmail } = await import("@/lib/mail");
    const email = await getUserEmail(profile.id);
    if (email) {
      await sendRegistrationConfirmEmail(email, event.title);
    }
  } catch (err) {
    console.error("Failed to send confirmation email", err);
  }

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}
