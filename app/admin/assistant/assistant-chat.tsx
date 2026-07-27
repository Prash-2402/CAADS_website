"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { askAssistant } from "./actions";
import { Bot, User, Send, Sparkles } from "lucide-react";

type Message = {
  role: "user" | "model";
  content: string;
};

const SUGGESTIONS = [
  "List all events in the system",
  "Show statistics for yellow forms",
  "Check attendance for the latest event",
  "Is there a volunteer named John?",
];

export default function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "Hello! I am the CAADS AI Assistant. How can I help you manage your events, volunteers, or yellow forms today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  const handleSubmit = (e?: React.FormEvent, customQuery?: string) => {
    e?.preventDefault();
    const query = customQuery || input;
    if (!query.trim() || isPending) return;

    if (!customQuery) setInput("");

    // Append user message
    const updatedMessages = [...messages, { role: "user", content: query } as Message];
    setMessages(updatedMessages);

    startTransition(async () => {
      const response = await askAssistant(updatedMessages, query);
      setMessages((prev) => [...prev, response as Message]);
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 max-w-[80%] ${
              m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 ${
                m.role === "user"
                  ? "bg-gold/20 border-gold/40 text-gold"
                  : "bg-bg-secondary border-border-gold/30 text-ivory"
              }`}
            >
              {m.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div
              className={`p-4 rounded-2xl text-sm font-body leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-gold text-bg font-semibold rounded-tr-none"
                  : "bg-bg border border-border-gold/20 text-muted rounded-tl-none"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {isPending && (
          <div className="flex items-start gap-3 max-w-[80%] mr-auto">
            <div className="w-8 h-8 rounded-full bg-bg-secondary border border-border-gold/30 text-gold flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="animate-spin text-gold" />
            </div>
            <div className="p-4 rounded-2xl text-sm font-body bg-bg border border-border-gold/20 text-muted rounded-tl-none flex items-center gap-2">
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length === 1 && !isPending && (
        <div className="px-6 pb-2 space-y-2 flex-shrink-0">
          <p className="text-xs text-muted font-display font-semibold uppercase tracking-wider">Suggested Queries</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSubmit(undefined, s)}
                className="px-3 py-1.5 rounded-lg border border-border-gold/30 bg-bg text-xs text-muted hover:border-gold hover:text-ivory transition-colors font-body text-left"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border-gold/30 flex gap-2 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isPending}
          placeholder="Ask about attendance, volunteers, or yellow forms..."
          className="flex-1 bg-bg border border-border-gold/30 rounded-xl px-4 py-3 text-ivory placeholder-muted focus:border-gold outline-none transition-all font-body text-sm disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending || !input.trim()}
          className="px-4 py-3 rounded-xl bg-gold text-bg hover:bg-gold-bright transition-colors flex items-center justify-center disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
