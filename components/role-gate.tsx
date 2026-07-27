import { redirect } from "next/navigation";
import { getRole } from "@/lib/supabase/auth";
import type { UserRole } from "@/types/database";

type RoleGateProps = {
  /** Roles that are allowed to see the children */
  allowed: UserRole[];
  /** Where to redirect if the user lacks the required role */
  redirectTo?: string;
  children: React.ReactNode;
};

/**
 * RoleGate — Server Component guard.
 *
 * Usage:
 *   <RoleGate allowed={["core_team", "admin"]}>
 *     <AdminPanel />
 *   </RoleGate>
 *
 * If the user is not authenticated or lacks the required role,
 * they are redirected. Role is always read server-side from the DB.
 */
export async function RoleGate({
  allowed,
  redirectTo = "/dashboard",
  children,
}: RoleGateProps) {
  const role = await getRole();

  if (!role) {
    redirect("/login");
  }

  if (!allowed.includes(role)) {
    redirect(redirectTo);
  }

  return <>{children}</>;
}

// ── Convenience wrappers ──────────────────────────────────────

/**
 * Renders children only if the user is authenticated (any role).
 * Redirects to /login if not authenticated.
 */
export async function AuthGate({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allowed={["student", "volunteer", "core_team", "admin"]}>
      {children}
    </RoleGate>
  );
}

/**
 * Renders children only if the user is a leader (core_team or admin).
 * Redirects to /dashboard if not authorized.
 */
export async function LeaderGate({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allowed={["core_team", "admin"]} redirectTo="/dashboard">
      {children}
    </RoleGate>
  );
}

/**
 * Renders children only if the user is an admin.
 * Redirects to /admin if not authorized.
 */
export async function AdminGate({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allowed={["admin"]} redirectTo="/admin">
      {children}
    </RoleGate>
  );
}
