import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Auth callback route — handles the email confirmation redirect from Supabase.
 * Supabase redirects here after the user clicks the confirmation link in their email.
 * We exchange the code for a session, then redirect to the dashboard.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If something went wrong, send them to login with an error hint
  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
