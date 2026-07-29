import { createClient } from "@/lib/supabase/server";
import { AdminGate } from "@/components/role-gate";
import type { Metadata } from "next";
import { updateMemberAccessAction } from "./actions";

export const metadata: Metadata = {
  title: "Members | Admin",
};

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const supabase = createClient();
  const query = searchParams?.q?.trim() || "";

  let membersQuery = supabase
    .from("profiles")
    .select("id, full_name, reg_no, role, is_staff")
    .order("full_name", { ascending: true });

  if (query) {
    membersQuery = membersQuery.or(`full_name.ilike.%${query}%,reg_no.ilike.%${query}%`);
  }

  const { data: members } = await membersQuery;

  return (
    <AdminGate>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-ivory">Members & Roles</h1>
          <p className="mt-2 font-body text-muted">
            Search members, update access levels, and manage staff badge eligibility.
          </p>
        </div>

        <form className="rounded-2xl border border-border-gold bg-bg-secondary p-5">
          <label htmlFor="q" className="mb-2 block text-sm font-medium text-ivory">
            Search Directory
          </label>
          <div className="flex gap-3">
            <input
              id="q"
              name="q"
              defaultValue={query}
              placeholder="Search by name or registration number"
              className="flex-1 rounded-xl border border-border-gold bg-bg px-4 py-2.5 text-sm text-ivory placeholder:text-muted focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-gold-bright"
            >
              Search
            </button>
          </div>
        </form>

        <div className="overflow-hidden rounded-2xl border border-border-gold bg-bg-secondary">
          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)_minmax(0,1fr)_auto_auto] gap-4 border-b border-border-gold/30 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">
            <span>Name</span>
            <span>Reg No</span>
            <span>Role</span>
            <span>Staff</span>
            <span>Save</span>
          </div>

          <div className="divide-y divide-border-gold/20">
            {members?.map((member) => (
              <form
                key={member.id}
                action={updateMemberAccessAction}
                className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)_minmax(0,1fr)_auto_auto] gap-4 px-6 py-4 text-sm"
              >
                <input type="hidden" name="userId" value={member.id} />
                <span className="font-medium text-ivory">{member.full_name}</span>
                <span className="text-muted">{member.reg_no || "N/A"}</span>
                <select
                  name="role"
                  defaultValue={member.role}
                  className="rounded-lg border border-border-gold/40 bg-bg px-3 py-2 text-sm text-ivory focus:border-gold focus:outline-none"
                >
                  <option value="student">Student</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="core_team">Core Team</option>
                  <option value="admin">Admin</option>
                </select>
                <label className="inline-flex items-center justify-start gap-2 text-sm text-ivory">
                  <input
                    type="checkbox"
                    name="isStaff"
                    defaultChecked={member.is_staff}
                    className="h-4 w-4 rounded border-border-gold bg-bg text-gold focus:ring-gold"
                  />
                  <span className={member.is_staff ? "text-gold" : "text-muted"}>Badge</span>
                </label>
                <button
                  type="submit"
                  className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-bg"
                >
                  Update
                </button>
              </form>
            ))}

            {(!members || members.length === 0) && (
              <div className="px-6 py-12 text-center text-sm text-muted">No members found.</div>
            )}
          </div>
        </div>
      </div>
    </AdminGate>
  );
}
