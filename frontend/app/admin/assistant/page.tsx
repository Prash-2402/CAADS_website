import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import AssistantChat from "./assistant-chat";

export const metadata = {
  title: "AI Assistant - CAADS",
};

export default function AssistantPage() {
  return (
    <div className="max-w-4xl space-y-8 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center gap-4 flex-shrink-0">
        <Link href="/admin" className="text-muted hover:text-ivory transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-ivory">AI Assistant</h1>
          <p className="font-body text-muted mt-1">Query event attendance, volunteer assignments, and system metrics.</p>
        </div>
      </div>

      <div className="bg-bg-secondary border border-border-gold rounded-2xl flex-1 flex flex-col overflow-hidden shadow-gold">
        <AssistantChat />
      </div>
    </div>
  );
}
