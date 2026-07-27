import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Link2, Trash2, Calendar, Users, FolderOpen } from "lucide-react";
import AddDocumentForm from "./add-document-form";
import { deleteDocument } from "./actions";

export const metadata = {
  title: "Documents Linker - CAADS",
};

export default async function DocumentsPage() {
  const supabase = createClient();

  // Fetch linked documents
  const { data: documents } = await supabase
    .from("documents")
    .select(`
      id,
      drive_link,
      event_id,
      meeting_id,
      events (
        title
      ),
      meetings (
        title
      )
    `)
    .order("created_at", { ascending: false });

  // Fetch events for association dropdown
  const { data: events } = await supabase
    .from("events")
    .select("id, title")
    .order("date", { ascending: false });

  // Fetch meetings for association dropdown
  const { data: meetings } = await supabase
    .from("meetings")
    .select("id, title")
    .order("date", { ascending: false });

  const handleDelete = async (formData: FormData) => {
    "use server";
    const id = formData.get("id") as string;
    await deleteDocument(id);
  };

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-muted hover:text-ivory transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-ivory font-semibold">Documents (Drive)</h1>
          <p className="font-body text-muted mt-1">Link shared Google Drive folders or documents to events and meetings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Document linker form */}
        <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 h-fit space-y-6">
          <h2 className="font-display text-xl font-bold text-ivory flex items-center gap-2">
            <Link2 className="text-gold" size={20} />
            Link Google Drive File
          </h2>
          <AddDocumentForm events={events || []} meetings={meetings || []} />
        </div>

        {/* Documents list */}
        <div className="lg:col-span-2 bg-bg-secondary border border-border-gold rounded-2xl p-6 md:p-8">
          <h2 className="font-display text-xl font-bold text-ivory mb-6 flex items-center gap-2">
            <FolderOpen className="text-gold" size={20} />
            Linked Files ({documents?.length || 0})
          </h2>
          <div className="divide-y divide-border-gold/20">
            {documents?.map((doc) => {
              const event = doc.events as any;
              const meeting = doc.meetings as any;
              const title = event?.title || meeting?.title || "Unknown Context";
              const isEvent = !!doc.event_id;

              return (
                <div key={doc.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${isEvent ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20"}`}>
                        {isEvent ? <Calendar size={10} /> : <Users size={10} />}
                        {isEvent ? "Event" : "Meeting"}
                      </span>
                      <h4 className="font-display font-semibold text-ivory truncate max-w-[250px] sm:max-w-md" title={title}>
                        {title}
                      </h4>
                    </div>
                    <a
                      href={doc.drive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-xs text-gold hover:underline block mt-1 truncate max-w-[300px] sm:max-w-lg"
                    >
                      {doc.drive_link}
                    </a>
                  </div>
                  <form action={handleDelete}>
                    <input type="hidden" name="id" value={doc.id} />
                    <button
                      type="submit"
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-red-500/20"
                      title="Unlink document"
                    >
                      <Trash2 size={16} />
                    </button>
                  </form>
                </div>
              );
            })}
            {(!documents || documents.length === 0) && (
              <p className="text-muted text-sm py-4">No linked files found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
