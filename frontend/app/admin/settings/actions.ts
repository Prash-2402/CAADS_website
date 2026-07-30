"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getRole } from "@/lib/supabase/auth";
import {
  highlightItemSchema,
  teamMemberSchema,
} from "@/lib/site-settings";

const marketingSettingsSchema = z.object({
  aboutTitle: z.string().min(1, "About title is required."),
  aboutInauguration: z.string().min(1, "About inauguration is required."),
  missionJson: z.string().min(1, "Mission JSON is required."),
  vision: z.string().min(1, "Vision is required."),
  objectivesJson: z.string().min(1, "Objectives JSON is required."),
  highlightsJson: z.string().min(1, "Highlights JSON is required."),
  teamJson: z.string().min(1, "Team JSON is required."),
});

async function checkAdmin() {
  const role = await getRole();
  if (role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
}

function parseJsonArray<T>(value: string, schema: z.ZodSchema<T>) {
  const parsedJson = JSON.parse(value);
  return z.array(schema).parse(parsedJson);
}

export async function updateMarketingSettingsAction(formData: FormData) {
  await checkAdmin();

  const parsed = marketingSettingsSchema.parse({
    aboutTitle: formData.get("aboutTitle"),
    aboutInauguration: formData.get("aboutInauguration"),
    missionJson: formData.get("missionJson"),
    vision: formData.get("vision"),
    objectivesJson: formData.get("objectivesJson"),
    highlightsJson: formData.get("highlightsJson"),
    teamJson: formData.get("teamJson"),
  });

  const mission = parseJsonArray(parsed.missionJson, z.string());
  const objectives = parseJsonArray(parsed.objectivesJson, z.string());
  const highlights = parseJsonArray(parsed.highlightsJson, highlightItemSchema);
  const teamMembers = parseJsonArray(parsed.teamJson, teamMemberSchema);

  const supabase = createClient();
  const { error } = await supabase.from("site_settings").upsert({
    id: true,
    about_title: parsed.aboutTitle,
    about_inauguration: parsed.aboutInauguration,
    mission,
    vision: parsed.vision,
    objectives,
    highlights,
    team_members: teamMembers,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function updateEventVisibilityAction(formData: FormData) {
  await checkAdmin();

  const eventId = z.string().uuid().parse(formData.get("eventId"));
  const isPublic = formData.get("isPublic") === "true";

  const supabase = createClient();
  const { error } = await supabase
    .from("events")
    .update({
      is_public: isPublic,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/admin/settings");
}
