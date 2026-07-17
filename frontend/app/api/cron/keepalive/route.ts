import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Vercel Cron Job — Runs every 6 days to query Supabase profiles
// to prevent the free tier DB from automatically pausing.
// Schedule: 0 0 */6 * * (Every 6 days)
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createServiceClient(supabaseUrl, supabaseServiceKey);

    // Fetch one row from profiles to trigger query activity
    const { data, error } = await supabase.from("profiles").select("id").limit(1);

    if (error) throw new Error(error.message);

    console.log("[Cron KeepAlive] Pinged Supabase profiles successfully.");
    return NextResponse.json({ success: true, pinged: true });
  } catch (err: any) {
    console.error("Cron KeepAlive failed:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
