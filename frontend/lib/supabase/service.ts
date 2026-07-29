import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * Server-only service-role client for flows that must validate secrets or
 * perform privileged audit/export work outside end-user RLS scope.
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes("your-project-ref")) {
    throw new Error("Missing Supabase service role configuration.");
  }

  return createServiceClient(supabaseUrl, supabaseServiceKey);
}
