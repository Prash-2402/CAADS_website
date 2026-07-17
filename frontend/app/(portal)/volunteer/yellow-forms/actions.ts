"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";

const YellowFormSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
  periods: z.array(z.string()).min(1, "Select at least one period"),
});

export type YellowFormState = {
  error?: string;
  success?: boolean;
  fieldErrors?: {
    eventId?: string[];
    periods?: string[];
  };
};

export async function requestYellowFormAction(
  _prevState: YellowFormState,
  formData: FormData
): Promise<YellowFormState> {
  const profile = await getProfile();

  if (!profile) {
    return { error: "You must be logged in." };
  }

  const raw = {
    eventId: formData.get("eventId"),
    periods: formData.getAll("periods"), // captures all checkboxes with name="periods"
  };

  const parsed = YellowFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createClient();

  // Status is ALWAYS forced to 'pending' server-side.
  const { error } = await supabase.from("yellow_forms").insert({
    user_id: profile.id,
    event_id: parsed.data.eventId,
    periods: parsed.data.periods,
    method: "manual",
    status: "pending",
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You have already requested a yellow form for this event." };
    }
    return { error: "Failed to request yellow form. Please try again later." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/volunteer/yellow-forms");
  revalidatePath(`/dashboard/events/${parsed.data.eventId}`);
  return { success: true };
}
