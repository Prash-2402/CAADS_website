import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST /auth/signout
 * Called by the sign-out button in the portal and admin sidebar layouts.
 * Signs the user out from Supabase (clears httpOnly cookie session),
 * then redirects to the home page.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  await supabase.auth.signOut();

  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/`, { status: 303 });
}
