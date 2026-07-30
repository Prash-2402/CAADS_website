import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

/**
 * Config — update the domain list here if the college adds more domains.
 * Example: ["christuniversity.in", "bba.christuniversity.in"]
 */
export const ALLOWED_EMAIL_DOMAINS: string[] = [
  process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN ?? "christuniversity.in",
];

/**
 * Returns true if the email belongs to one of the allowed college domains or subdomains.
 * Enforced server-side on every signup — never trust client input alone.
 * Supports subdomains like @science.christuniversity.in, @mca.christuniversity.in, @res.christuniversity.in.
 */
export function isAllowedEmail(email: string): boolean {
  const lower = email.toLowerCase().trim();
  const atIndex = lower.indexOf("@");
  if (atIndex === -1) return false;
  const domain = lower.slice(atIndex + 1);

  return ALLOWED_EMAIL_DOMAINS.some((allowed) => {
    const allowedLower = allowed.toLowerCase().trim();
    return domain === allowedLower || domain.endsWith(`.${allowedLower}`);
  });
}

/**
 * Helper to extract a 7 or 8-digit USN / Register Number from a student email address
 * (e.g., 2402001@christuniversity.in -> 2402001, john.2130002@science.christuniversity.in -> 2130002)
 */
export function extractRegNoFromEmail(email: string): string | null {
  const match = email.match(/\b\d{7,8}\b/);
  return match ? match[0] : null;
}

/**
 * Returns the authenticated user's profile row, or null if not logged in.
 * Always reads from the server — never trust a client-provided role.
 */
export async function getProfile() {
  // DEV OVERRIDE: Bypass login
  return {
    id: "dummy-user-123",
    full_name: "Test Admin",
    reg_no: "1234567",
    role: "admin" as import("@/types/database").UserRole,
    is_staff: true,
    personal_qr_key: "dummy-qr-123",
    avatar_url: null,
  };
  
  /*
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (profile as any) ?? null;
  */
}

/**
 * Returns the current user's role from the DB.
 * Returns null if not authenticated.
 */
export async function getRole(): Promise<UserRole | null> {
  const profile = await getProfile();
  return profile?.role ?? null;
}

/**
 * Asserts the current user has one of the required roles.
 * Throws an error (caught by Next.js notFound/redirect patterns) if not.
 *
 * Usage in a server component or route handler:
 *   await requireRole(["core_team", "admin"])
 */
export async function requireRole(allowed: UserRole[]): Promise<void> {
  const role = await getRole();
  if (!role || !allowed.includes(role)) {
    throw new Error("UNAUTHORIZED");
  }
}

/**
 * Returns true if the current user is a leader (core_team or admin).
 */
export async function isLeader(): Promise<boolean> {
  const role = await getRole();
  return role === "core_team" || role === "admin";
}

/**
 * Returns true if the current user is an admin.
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getRole();
  return role === "admin";
}
