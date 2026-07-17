import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getUserEmail, sendEventReminderEmail } from "@/lib/mail";
import { format, addDays } from "date-fns";

export const dynamic = "force-dynamic";

/**
 * Vercel Cron Job — Runs daily to send event reminders 24h before an event starts.
 * Schedule: 0 9 * * * (Every day at 9:00 AM)
 */
export async function GET(req: Request) {
  try {
    // Authenticate cron caller (optional check for Vercel Cron signature)
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createServiceClient(supabaseUrl, supabaseServiceKey);

    // Find events happening tomorrow
    const tomorrowStr = format(addDays(new Date(), 1), "yyyy-MM-dd");
    
    const { data: events, error: eventsErr } = await supabase
      .from("events")
      .select("id, title, date")
      .eq("date", tomorrowStr);

    if (eventsErr) throw new Error(eventsErr.message);

    let remindersSent = 0;

    for (const event of events || []) {
      // Find all registered users for this event
      const { data: regs } = await supabase
        .from("event_registrations")
        .select("user_id")
        .eq("event_id", event.id);

      for (const reg of regs || []) {
        const email = await getUserEmail(reg.user_id);
        if (email) {
          await sendEventReminderEmail(email, event.title, format(new Date(event.date), "PPP"));
          remindersSent++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      eventsChecked: events?.length || 0,
      remindersSent,
    });
  } catch (err: any) {
    console.error("Cron Reminder Job failed:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
