import { createClient } from "@/lib/supabase/server";
import { AdminGate } from "@/components/role-gate";
import type { Metadata } from "next";
import { getSettingsTextareaDefaults, getSiteSettings } from "@/lib/site-settings";
import {
  updateEventVisibilityAction,
  updateMarketingSettingsAction,
} from "./actions";

export const metadata: Metadata = {
  title: "Settings | Admin",
};

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams?: {
    recipient?: string;
    template?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}) {
  const supabase = createClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, title, date, is_public")
    .order("date", { ascending: false })
    .limit(10);
  const settings = await getSiteSettings();
  const { highlightsJson, teamJson } = getSettingsTextareaDefaults();

  let mailLogQuery = supabase
    .from("mail_log")
    .select("id, recipient, subject, template, sent_at")
    .order("sent_at", { ascending: false })
    .limit(20);

  if (searchParams?.recipient?.trim()) {
    mailLogQuery = mailLogQuery.ilike("recipient", `%${searchParams.recipient.trim()}%`);
  }

  if (searchParams?.template?.trim()) {
    mailLogQuery = mailLogQuery.ilike("template", `%${searchParams.template.trim()}%`);
  }

  if (searchParams?.dateFrom?.trim()) {
    mailLogQuery = mailLogQuery.gte("sent_at", `${searchParams.dateFrom.trim()}T00:00:00.000Z`);
  }

  if (searchParams?.dateTo?.trim()) {
    mailLogQuery = mailLogQuery.lte("sent_at", `${searchParams.dateTo.trim()}T23:59:59.999Z`);
  }

  const { data: mailLog } = await mailLogQuery;

  return (
    <AdminGate>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-ivory">Site Settings</h1>
          <p className="mt-2 font-body text-muted">
            Manage marketing content, event visibility, and recent email audit activity.
          </p>
        </div>

        <div className="rounded-2xl border border-border-gold bg-bg-secondary p-6">
          <h2 className="font-display text-xl font-semibold text-ivory">Recent Event Visibility</h2>
          <p className="mt-1 text-sm text-muted">
            Public events are visible on the student-facing event surfaces. Draft events remain leader-only.
          </p>

          <div className="mt-6 space-y-3">
            {events?.map((event) => (
              <form
                key={event.id}
                action={updateEventVisibilityAction}
                className="flex items-center justify-between rounded-xl border border-border-gold/20 bg-bg px-4 py-3"
              >
                <input type="hidden" name="eventId" value={event.id} />
                <div>
                  <p className="font-medium text-ivory">{event.title}</p>
                  <p className="text-xs text-muted">{event.date}</p>
                </div>
                <button
                  type="submit"
                  name="isPublic"
                  value={event.is_public ? "false" : "true"}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    event.is_public
                      ? "border-gold/40 bg-gold/10 text-gold hover:bg-gold hover:text-bg"
                      : "border-border-gold/30 bg-bg-secondary text-muted hover:border-gold hover:text-gold"
                  }`}
                >
                  {event.is_public ? "Public" : "Draft"}
                </button>
              </form>
            ))}

            {(!events || events.length === 0) && (
              <div className="rounded-xl border border-dashed border-border-gold/30 px-4 py-8 text-center text-sm text-muted">
                No events available yet.
              </div>
            )}
          </div>
        </div>

        <form action={updateMarketingSettingsAction} className="space-y-6 rounded-2xl border border-border-gold bg-bg-secondary p-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-ivory">Marketing Content</h2>
            <p className="mt-1 text-sm text-muted">
              These values power the public home page without a redeploy.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="aboutTitle" className="mb-2 block text-sm font-medium text-ivory">About Title</label>
              <input
                id="aboutTitle"
                name="aboutTitle"
                defaultValue={settings.about_title}
                className="w-full rounded-xl border border-border-gold bg-bg px-4 py-2.5 text-sm text-ivory focus:border-gold focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="aboutInauguration" className="mb-2 block text-sm font-medium text-ivory">About Inauguration</label>
              <textarea
                id="aboutInauguration"
                name="aboutInauguration"
                rows={5}
                defaultValue={settings.about_inauguration}
                className="w-full rounded-xl border border-border-gold bg-bg px-4 py-2.5 text-sm text-ivory focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="vision" className="mb-2 block text-sm font-medium text-ivory">Vision</label>
              <textarea
                id="vision"
                name="vision"
                rows={4}
                defaultValue={settings.vision}
                className="w-full rounded-xl border border-border-gold bg-bg px-4 py-2.5 text-sm text-ivory focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="missionJson" className="mb-2 block text-sm font-medium text-ivory">Mission JSON</label>
              <textarea
                id="missionJson"
                name="missionJson"
                rows={6}
                defaultValue={JSON.stringify(settings.mission, null, 2)}
                className="w-full rounded-xl border border-border-gold bg-bg px-4 py-2.5 font-mono text-xs text-ivory focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="objectivesJson" className="mb-2 block text-sm font-medium text-ivory">Objectives JSON</label>
              <textarea
                id="objectivesJson"
                name="objectivesJson"
                rows={6}
                defaultValue={JSON.stringify(settings.objectives, null, 2)}
                className="w-full rounded-xl border border-border-gold bg-bg px-4 py-2.5 font-mono text-xs text-ivory focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="highlightsJson" className="mb-2 block text-sm font-medium text-ivory">Highlights JSON</label>
              <textarea
                id="highlightsJson"
                name="highlightsJson"
                rows={12}
                defaultValue={JSON.stringify(settings.highlights, null, 2) || highlightsJson}
                className="w-full rounded-xl border border-border-gold bg-bg px-4 py-2.5 font-mono text-xs text-ivory focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="teamJson" className="mb-2 block text-sm font-medium text-ivory">Team JSON</label>
              <textarea
                id="teamJson"
                name="teamJson"
                rows={12}
                defaultValue={JSON.stringify(settings.team_members, null, 2) || teamJson}
                className="w-full rounded-xl border border-border-gold bg-bg px-4 py-2.5 font-mono text-xs text-ivory focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-gold-bright"
          >
            Save Marketing Content
          </button>
        </form>

        <div className="space-y-4 rounded-2xl border border-border-gold bg-bg-secondary p-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-ivory">Mail Audit Log</h2>
            <p className="mt-1 text-sm text-muted">
              Filter recent mail activity by recipient, template, or send date.
            </p>
          </div>

          <form className="grid gap-4 md:grid-cols-4">
            <input
              name="recipient"
              defaultValue={searchParams?.recipient || ""}
              placeholder="Recipient"
              className="rounded-xl border border-border-gold bg-bg px-4 py-2.5 text-sm text-ivory focus:border-gold focus:outline-none"
            />
            <input
              name="template"
              defaultValue={searchParams?.template || ""}
              placeholder="Template"
              className="rounded-xl border border-border-gold bg-bg px-4 py-2.5 text-sm text-ivory focus:border-gold focus:outline-none"
            />
            <input
              type="date"
              name="dateFrom"
              defaultValue={searchParams?.dateFrom || ""}
              className="rounded-xl border border-border-gold bg-bg px-4 py-2.5 text-sm text-ivory focus:border-gold focus:outline-none"
            />
            <input
              type="date"
              name="dateTo"
              defaultValue={searchParams?.dateTo || ""}
              className="rounded-xl border border-border-gold bg-bg px-4 py-2.5 text-sm text-ivory focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-gold-bright md:col-span-4 md:w-fit"
            >
              Apply Filters
            </button>
          </form>

          <div className="overflow-hidden rounded-xl border border-border-gold/20">
            <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.2fr)] gap-4 border-b border-border-gold/20 bg-bg px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
              <span>Recipient</span>
              <span>Template</span>
              <span>Sent At</span>
            </div>
            <div className="divide-y divide-border-gold/10">
              {mailLog?.map((item) => (
                <div key={item.id} className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.2fr)] gap-4 px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ivory">{item.recipient}</p>
                    <p className="truncate text-xs text-muted">{item.subject}</p>
                  </div>
                  <span className="text-muted">{item.template}</span>
                  <span className="text-muted">{new Date(item.sent_at).toLocaleString()}</span>
                </div>
              ))}
              {(!mailLog || mailLog.length === 0) && (
                <div className="px-4 py-8 text-center text-sm text-muted">No mail log entries match the current filters.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminGate>
  );
}
