"use server";

import { createClient } from "@/lib/supabase/server";
import { getRole } from "@/lib/supabase/auth";

import { SchemaType } from "@google/generative-ai";

async function checkLeader() {
  const role = await getRole();
  if (role !== "core_team" && role !== "admin") {
    throw new Error("Unauthorized: Leader access required");
  }
}

// Predefined functions for Gemini tools

async function getEventList() {
  const supabase = createClient();
  const { data } = await supabase.from("events").select("id, title, date").order("date", { ascending: false });
  return data || [];
}

async function getEventAttendance(eventId: string) {
  const supabase = createClient();
  const { data } = await supabase.from("attendance").select("status").eq("event_id", eventId);
  
  const stats = { approved: 0, pending: 0, rejected: 0, total: data?.length || 0 };
  data?.forEach((a) => {
    if (a.status === "approved") stats.approved++;
    else if (a.status === "pending") stats.pending++;
    else if (a.status === "rejected") stats.rejected++;
  });
  return stats;
}

async function getVolunteerStatus(volunteerName: string) {
  const supabase = createClient();
  // Find volunteer by name
  const { data: vol } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .ilike("full_name", `%${volunteerName}%`)
    .limit(1)
    .maybeSingle();

  if (!vol) return { error: `No volunteer found matching: ${volunteerName}` };

  const { data: assignments } = await supabase
    .from("volunteer_assignments")
    .select(`
      role,
      status,
      events (
        title,
        date
      )
    `)
    .eq("user_id", vol.id);

  return {
    volunteer: vol,
    assignments: assignments || [],
  };
}

async function getYellowFormStats() {
  const supabase = createClient();
  const { data } = await supabase.from("yellow_forms").select("status");

  const stats = { approved: 0, pending: 0, rejected: 0, total: data?.length || 0 };
  data?.forEach((yf) => {
    if (yf.status === "approved") stats.approved++;
    else if (yf.status === "pending") stats.pending++;
    else if (yf.status === "rejected") stats.rejected++;
  });
  return stats;
}

// Main assistant query interface

export async function askAssistant(history: { role: string; content: string }[], query: string) {
  try {
    await checkLeader();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        role: "model",
        content: "CAADS AI Assistant requires `GEMINI_API_KEY` to be configured in `.env.local`. Here is a mock response: *Query received, function calling is functional.*",
      };
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [
        {
          functionDeclarations: [
            {
              name: "getEventList",
              description: "Returns the list of CAADS events with their title, date, and UUIDs.",
              parameters: { type: SchemaType.OBJECT, properties: {} },
            },
            {
              name: "getEventAttendance",
              description: "Returns attendance counts (approved, pending, rejected) for a specific event ID.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  eventId: { type: SchemaType.STRING, description: "The UUID of the event" },
                },
                required: ["eventId"],
              },
            },
            {
              name: "getVolunteerStatus",
              description: "Looks up volunteer profiles and returns their upcoming event assignments by name.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  volunteerName: { type: SchemaType.STRING, description: "First or full name of the volunteer" },
                },
                required: ["volunteerName"],
              },
            },
            {
              name: "getYellowFormStats",
              description: "Returns general counts of yellow form requests by approved, pending, or rejected status.",
              parameters: { type: SchemaType.OBJECT, properties: {} },
            },
          ],
        },
      ],
    });

    const chat = model.startChat({
      history: history.map((h) => ({
        role: h.role,
        parts: [{ text: h.content }],
      })),
    });

    const result = await chat.sendMessage(query);
    const functionCalls = result.response.functionCalls();

    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      const args = call.args as any;
      let functionResponse: any;

      if (call.name === "getEventList") {
        functionResponse = await getEventList();
      } else if (call.name === "getEventAttendance") {
        functionResponse = await getEventAttendance(args.eventId);
      } else if (call.name === "getVolunteerStatus") {
        functionResponse = await getVolunteerStatus(args.volunteerName);
      } else if (call.name === "getYellowFormStats") {
        functionResponse = await getYellowFormStats();
      }

      // Send the function response back to Gemini to synthesize final model response
      const followUp = await chat.sendMessage([
        {
          functionResponse: {
            name: call.name,
            response: { result: functionResponse },
          },
        },
      ]);

      return {
        role: "model",
        content: followUp.response.text(),
      };
    }

    return {
      role: "model",
      content: result.response.text(),
    };
  } catch (err: any) {
    return {
      role: "model",
      content: `Assistant Error: ${err.message || "An error occurred during query generation"}`,
    };
  }
}
