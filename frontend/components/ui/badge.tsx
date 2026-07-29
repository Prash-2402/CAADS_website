import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeVariant =
  | "pending"
  | "approved"
  | "rejected"
  | "invited"
  | "accepted"
  | "declined"
  | "default"
  | "gold";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  pending:
    "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  approved:
    "bg-green-500/10 text-green-400 border-green-500/30",
  rejected:
    "bg-red-500/10 text-red-400 border-red-500/30",
  invited:
    "bg-blue-500/10 text-blue-400 border-blue-500/30",
  accepted:
    "bg-green-500/10 text-green-400 border-green-500/30",
  declined:
    "bg-red-500/10 text-red-400 border-red-500/30",
  gold:
    "bg-gold/10 text-gold border-gold/30",
  default:
    "bg-bg-secondary text-muted border-border-gold/30",
};

/**
 * Status Badge component.
 * Accepts semantic status values and applies consistent CAADS design-system colours.
 */
function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Helper: derives BadgeVariant from a raw status string (DB values).
 * Falls back to "default" for unknown values.
 */
function statusToBadgeVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    pending: "pending",
    approved: "approved",
    rejected: "rejected",
    invited: "invited",
    accepted: "accepted",
    declined: "declined",
  };
  return map[status] ?? "default";
}

export { Badge, statusToBadgeVariant };
export type { BadgeProps, BadgeVariant };
