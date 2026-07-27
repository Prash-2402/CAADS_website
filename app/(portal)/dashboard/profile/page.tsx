import { getProfile } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ProfileForm } from "./_components/profile-form";
import { QrBadgeViewer } from "./_components/qr-badge-viewer";

export const metadata: Metadata = {
  title: "Profile & ID",
};

export default async function ProfilePage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  // Re-fetch to ensure we have the absolute latest profile data
  const supabase = createClient();
  const { data: latestProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profile.id)
    .single();

  if (!latestProfile) redirect("/login");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-ivory">My ID & Profile</h1>
        <p className="font-body text-muted mt-1">Manage your details and view your badge.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 md:p-8 shadow-gold">
          <h2 className="font-display text-xl font-bold text-ivory mb-6">Profile Settings</h2>
          <ProfileForm initialName={latestProfile.full_name} />
          
          <div className="mt-8 pt-6 border-t border-border-gold/30">
            <h3 className="font-body text-sm font-semibold text-ivory mb-2">Account Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Role:</span>
                <span className="text-ivory capitalize">{latestProfile.role.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Staff Status:</span>
                <span className={latestProfile.is_staff ? "text-green-400" : "text-ivory"}>
                  {latestProfile.is_staff ? "Active" : "Not Staff"}
                </span>
              </div>
              {latestProfile.reg_no && (
                <div className="flex justify-between">
                  <span className="text-muted">Reg No:</span>
                  <span className="text-ivory">{latestProfile.reg_no}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {latestProfile.is_staff && (
          <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 md:p-8 shadow-gold">
            <h2 className="font-display text-xl font-bold text-ivory mb-6">Personal QR Badge</h2>
            <QrBadgeViewer 
              userId={latestProfile.id}
              initialKey={latestProfile.personal_qr_key}
              appUrl={appUrl}
            />
          </div>
        )}
      </div>
    </div>
  );
}
