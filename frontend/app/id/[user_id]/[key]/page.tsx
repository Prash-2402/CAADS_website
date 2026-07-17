import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout/public-layout";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { user_id: string, key: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", params.user_id)
    .eq("personal_qr_key", params.key)
    .single();

  if (!profile) return { title: "Profile Not Found" };

  return {
    title: `${profile.full_name} | CAADS`,
  };
}

export default async function PublicProfilePage({ params }: { params: { user_id: string, key: string } }) {
  const supabase = createClient();
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_staff, avatar_url") // EXPLICITLY ONLY SELECT PUBLIC FIELDS
    .eq("id", params.user_id)
    .eq("personal_qr_key", params.key)
    .single();

  if (!profile || !profile.is_staff) {
    notFound();
  }

  return (
    <PublicLayout>
      <div className="min-h-[80vh] bg-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-bg-secondary rounded-2xl border border-border-gold shadow-gold overflow-hidden">
          {/* Header/Cover */}
          <div className="h-32 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/20 via-bg-secondary to-bg-secondary border-b border-border-gold" />
          
          <div className="px-8 pb-10 relative -mt-16 text-center">
            {/* Avatar */}
            <div className="w-32 h-32 mx-auto rounded-full bg-bg border-4 border-gold/50 flex items-center justify-center overflow-hidden mb-6 shadow-xl">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gold/10 flex items-center justify-center text-gold font-display font-bold text-5xl">
                  {profile.full_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <h1 className="font-display text-3xl font-bold text-ivory mb-2">
              {profile.full_name}
            </h1>
            
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-sm font-semibold uppercase tracking-wider">
              {profile.role.replace("_", " ")}
            </div>

            <div className="mt-8 pt-8 border-t border-border-gold/30">
              <p className="font-body text-sm text-muted">
                Official Staff Member of CAADS
                <br />
                Centre for Artificial Intelligence & Data Science
                <br />
                Christ University
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
