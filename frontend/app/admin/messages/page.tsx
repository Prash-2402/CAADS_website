import { createClient } from "@/lib/supabase/server";
import { LeaderGate } from "@/components/role-gate";
import { format } from "date-fns";
import { Mail } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Messages | Admin",
};

export default async function AdminMessagesPage() {
  const supabase = createClient();
  
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <LeaderGate>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-ivory">Contact Messages</h1>
          <p className="font-body text-muted mt-2">View messages submitted through the public site.</p>
        </div>

        <div className="space-y-4">
          {messages?.map((msg) => (
            <div key={msg.id} className="bg-bg-secondary border border-border-gold rounded-xl p-6">
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-border-gold/30">
                <div>
                  <h3 className="font-display font-semibold text-ivory text-lg">
                    {msg.name}
                  </h3>
                  <a href={`mailto:${msg.email}`} className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-bright mt-1 transition-colors">
                    <Mail size={14} />
                    {msg.email}
                  </a>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted">
                    {format(new Date(msg.created_at), "MMM d, yyyy")}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {format(new Date(msg.created_at), "h:mm a")}
                  </p>
                </div>
              </div>
              <p className="font-body text-ivory whitespace-pre-wrap text-sm leading-relaxed">
                {msg.message}
              </p>
            </div>
          ))}
          
          {(!messages || messages.length === 0) && (
            <div className="py-12 text-center border border-dashed border-border-gold rounded-xl">
              <p className="text-muted font-body">No contact messages received yet.</p>
            </div>
          )}
        </div>
      </div>
    </LeaderGate>
  );
}
