"use server";

import { createClient } from "@/lib/supabase/server";
import { getRole } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const meetingSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  date: z.string().min(10, "Invalid date and time"),
  agenda: z.string().optional().nullable(),
});

async function checkLeader() {
  const role = await getRole();
  if (role !== "core_team" && role !== "admin") {
    throw new Error("Unauthorized: Leader access required");
  }
}

export async function createMeeting(prevState: any, formData: FormData) {
  try {
    await checkLeader();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const rawData = {
      title: formData.get("title"),
      date: formData.get("date"), // Expecting ISO-8601 string from datetime-local
      agenda: formData.get("agenda") || null,
    };

    const validated = meetingSchema.parse(rawData);

    // Insert meeting
    const { data: meeting, error } = await supabase
      .from("meetings")
      .insert({
        title: validated.title,
        date: new Date(validated.date).toISOString(),
        agenda: validated.agenda,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    // Initialize empty meeting minutes
    await supabase.from("meeting_minutes").insert({
      meeting_id: meeting.id,
      raw_notes: "",
      ai_refined_notes: "",
    });

    revalidatePath("/admin/meetings");
    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0].message };
    }
    return { success: false, error: err.message || "Failed to schedule meeting" };
  }
}

export async function updateMeetingNotes(meetingId: string, rawNotes: string) {
  try {
    await checkLeader();
    const supabase = createClient();

    const { error } = await supabase
      .from("meeting_minutes")
      .upsert(
        {
          meeting_id: meetingId,
          raw_notes: rawNotes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "meeting_id" }
      );

    if (error) return { success: false, error: error.message };

    revalidatePath(`/admin/meetings/${meetingId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function logMeetingAttendance(meetingId: string, userId: string, status: "approved" | "rejected") {
  try {
    await checkLeader();
    const supabase = createClient();

    const { error } = await supabase
      .from("meeting_attendance")
      .upsert(
        {
          meeting_id: meetingId,
          user_id: userId,
          method: "staff_scan", // Or manual scan
          status,
        },
        { onConflict: "meeting_id,user_id" }
      );

    if (error) return { success: false, error: error.message };

    revalidatePath(`/admin/meetings/${meetingId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateGrievanceStatus(id: string, status: "open" | "resolved") {
  try {
    await checkLeader();
    const supabase = createClient();

    const { error } = await supabase
      .from("grievances")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/meetings");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Use Gemini API to refine raw notes into professional meeting minutes.
 */
export async function refineMinutesWithAI(meetingId: string, rawNotes: string) {
  try {
    await checkLeader();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful fallback if API key is not configured yet
      const fallbackNotes = `### AI Refined Minutes (Mock)\n\n**Agenda**: Scheduled topics\n\n**Discussion Points**:\n- ${rawNotes.split("\n").join("\n- ")}\n\n*Note: Setup GEMINI_API_KEY in .env.local for full AI generation.*`;
      
      const supabase = createClient();
      await supabase.from("meeting_minutes").upsert(
        {
          meeting_id: meetingId,
          ai_refined_notes: fallbackNotes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "meeting_id" }
      );
      
      revalidatePath(`/admin/meetings/${meetingId}`);
      return { success: true, refined: fallbackNotes };
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are the CAADS AI Assistant. Your task is to refine the following raw meeting notes into a clean, professional, and well-structured set of meeting minutes using markdown.
    
Include sections like:
- **Meeting Summary & Agenda**
- **Detailed Discussion Points**
- **Key Decisions Made**
- **Action Items & Next Steps** (with assignees if mentioned)

Raw Notes:
"""
${rawNotes}
"""

Ensure the output is clean markdown. Do not include any conversational intros, explanations, or outros in your response. Begin directly with the refined minutes.`;

    const result = await model.generateContent(prompt);
    const refinedText = result.response.text();

    const supabase = createClient();
    const { error } = await supabase
      .from("meeting_minutes")
      .upsert(
        {
          meeting_id: meetingId,
          ai_refined_notes: refinedText,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "meeting_id" }
      );

    if (error) return { success: false, error: error.message };

    revalidatePath(`/admin/meetings/${meetingId}`);
    return { success: true, refined: refinedText };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to refine minutes" };
  }
}

