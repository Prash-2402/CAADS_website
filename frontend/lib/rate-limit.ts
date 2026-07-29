import { headers } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase/service";

type RateLimitConfig = {
  action: "event_registration" | "attendance_self_claim" | "yellow_form_request";
  userId: string;
  maxAttempts: number;
  windowSeconds: number;
};

function getClientIp() {
  const headerStore = headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown-ip";
  }

  const realIp = headerStore.get("x-real-ip");
  return realIp?.trim() || "unknown-ip";
}

export async function enforceRateLimit({
  action,
  userId,
  maxAttempts,
  windowSeconds,
}: RateLimitConfig) {
  const serviceSupabase = createServiceRoleClient();
  const ip = getClientIp();
  const actorKey = `${userId}:${ip}`;
  const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();

  const { count, error: countError } = await serviceSupabase
    .from("rate_limit_events")
    .select("id", { count: "exact", head: true })
    .eq("action", action)
    .eq("actor_key", actorKey)
    .gte("created_at", windowStart);

  if (countError) {
    throw new Error("Unable to validate request rate limit.");
  }

  if ((count ?? 0) >= maxAttempts) {
    return {
      allowed: false,
      message: "Too many requests. Please wait a few minutes and try again.",
    };
  }

  const { error: insertError } = await serviceSupabase.from("rate_limit_events").insert({
    action,
    actor_key: actorKey,
  });

  if (insertError) {
    throw new Error("Unable to record request rate limit.");
  }

  return { allowed: true as const };
}
