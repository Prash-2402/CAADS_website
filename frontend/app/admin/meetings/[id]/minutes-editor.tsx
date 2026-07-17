"use client";

import { useState, useTransition } from "react";
import { updateMeetingNotes, refineMinutesWithAI } from "../actions";
import { Sparkles, Save, Check } from "lucide-react";

type MinutesEditorProps = {
  meetingId: string;
  initialRawNotes: string;
  initialAiNotes: string;
  sentAt?: string | null;
};

export default function MinutesEditor({
  meetingId,
  initialRawNotes,
  initialAiNotes,
  sentAt,
}: MinutesEditorProps) {
  const [rawNotes, setRawNotes] = useState(initialRawNotes);
  const [aiNotes, setAiNotes] = useState(initialAiNotes);
  const [savePending, startSaveTransition] = useTransition();
  const [aiPending, startAiTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSave = () => {
    setError("");
    setSaveSuccess(false);
    startSaveTransition(async () => {
      const res = await updateMeetingNotes(meetingId, rawNotes);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(res.error || "Failed to save notes");
      }
    });
  };

  const handleAiRefinement = () => {
    if (!rawNotes.trim()) {
      setError("Please write some raw notes first before refining them with AI.");
      return;
    }

    setError("");
    startAiTransition(async () => {
      const res = await refineMinutesWithAI(meetingId, rawNotes);
      if (res.success) {
        setAiNotes(res.refined || "");
      } else {
        setError(res.error || "AI refinement failed");
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-body">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Raw Notes Input */}
        <div className="space-y-4">
          <label htmlFor="rawNotes" className="block text-sm font-semibold text-ivory font-display">
            Raw Discussion Notes
          </label>
          <textarea
            id="rawNotes"
            value={rawNotes}
            onChange={(e) => setRawNotes(e.target.value)}
            rows={15}
            placeholder="Type bullet points or raw transcripts from the meeting here..."
            className="w-full bg-bg border border-border-gold/30 rounded-2xl px-4 py-3 text-ivory placeholder-muted focus:border-gold outline-none transition-all font-body text-sm resize-y"
          />

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={savePending}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-bg border border-border-gold/50 text-ivory font-semibold text-sm hover:bg-gold/10 transition-colors disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check size={16} className="text-green-400" /> Saved
                </>
              ) : (
                <>
                  <Save size={16} /> Save Notes
                </>
              )}
            </button>

            <button
              onClick={handleAiRefinement}
              disabled={aiPending || !rawNotes.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-bg font-semibold text-sm hover:bg-gold-bright transition-colors disabled:opacity-50"
            >
              <Sparkles size={16} className={aiPending ? "animate-pulse" : ""} />
              {aiPending ? "AI Refining..." : "Refine Minutes (AI)"}
            </button>
          </div>
        </div>

        {/* AI Refined Minutes Viewer */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-ivory font-display">
            AI-Refined Meeting Minutes
          </label>
          <div className="w-full min-h-[360px] bg-bg border border-border-gold/30 rounded-2xl p-4 md:p-6 overflow-y-auto max-h-[400px]">
            {aiPending ? (
              <div className="flex flex-col items-center justify-center h-full text-muted space-y-3 py-16">
                <Sparkles size={24} className="animate-spin text-gold" />
                <p className="font-body text-xs">Gemini is structuring your minutes...</p>
              </div>
            ) : aiNotes ? (
              <div className="prose prose-invert prose-sm max-w-none font-body text-sm text-muted whitespace-pre-wrap">
                {aiNotes}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted py-16 text-center">
                <p className="font-display font-semibold text-ivory">No AI minutes generated yet</p>
                <p className="text-xs max-w-xs mt-1">
                  Click the &quot;Refine Minutes (AI)&quot; button on the left to structure your raw notes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
