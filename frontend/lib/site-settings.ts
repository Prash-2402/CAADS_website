import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { marketingData } from "@/data/marketing";

export const highlightItemSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
});

export const teamMemberSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  image: z.string().url(),
  linkedin: z.string().url().or(z.literal("#")),
});

export const siteSettingsSchema = z.object({
  about_title: z.string().min(1),
  about_inauguration: z.string().min(1),
  mission: z.array(z.string()).min(1),
  vision: z.string().min(1),
  objectives: z.array(z.string()).min(1),
  highlights: z.array(highlightItemSchema).min(1),
  team_members: z.array(teamMemberSchema).min(1),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

const defaultSettings: SiteSettings = {
  about_title: marketingData.about.title,
  about_inauguration: marketingData.about.inauguration,
  mission: marketingData.about.mission,
  vision: marketingData.about.vision,
  objectives: marketingData.about.objectives,
  highlights: marketingData.highlights,
  team_members: marketingData.team,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("about_title, about_inauguration, mission, vision, objectives, highlights, team_members")
    .eq("id", true)
    .maybeSingle();

  const parsed = siteSettingsSchema.safeParse(data);
  return parsed.success ? parsed.data : defaultSettings;
}

export function getDefaultSiteSettings() {
  return defaultSettings;
}

export function getSettingsTextareaDefaults() {
  return {
    missionJson: JSON.stringify(defaultSettings.mission, null, 2),
    objectivesJson: JSON.stringify(defaultSettings.objectives, null, 2),
    highlightsJson: JSON.stringify(defaultSettings.highlights, null, 2),
    teamJson: JSON.stringify(defaultSettings.team_members, null, 2),
  };
}
