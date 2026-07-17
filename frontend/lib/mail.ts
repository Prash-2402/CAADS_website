import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

// We use service role key for audit logging from server actions to bypass RLS restrictions on logs
import { createClient as createServiceClient } from "@supabase/supabase-js";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM_EMAIL = "CAADS Club <onboarding@resend.dev>"; // Resend sandbox default

/**
 * Audit log helper that writes directly to mail_log using the Supabase client.
 */
async function logEmail(recipient: string, subject: string, template: string, metadata: any) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    // We instantiate a service role client to ensure the log is inserted successfully 
    // even if the active user role doesn't have insert permissions on mail_log
    const supabase = createServiceClient(supabaseUrl, supabaseServiceKey);

    await supabase.from("mail_log").insert({
      recipient,
      subject,
      template,
      metadata,
      sent_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to write to mail_log", err);
  }
}

/**
 * Retrieve user email address by ID from auth.users using the service role client.
 */
export async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createServiceClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (error || !data.user) return null;
    return data.user.email || null;
  } catch (err) {
    console.error("Failed to get user email", err);
    return null;
  }
}

/**
 * Standardized email dispatcher with Resend connection and database log audit.
 */
export async function sendEmail({
  to,
  subject,
  html,
  template,
  metadata = {},
}: {
  to: string;
  subject: string;
  html: string;
  template: string;
  metadata?: any;
}) {
  console.log(`[Email Dispatch] To: ${to} | Subject: ${subject} | Template: ${template}`);
  
  let resendId = null;

  if (resend) {
    try {
      const response = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      });
      resendId = response.data?.id || null;
    } catch (err) {
      console.error(`Resend API Error for ${to}:`, err);
    }
  } else {
    console.warn("RESEND_API_KEY is not configured. Email sending simulated.");
  }

  // Always log the audit trail to mail_log
  await logEmail(to, subject, template, { ...metadata, resendId, simulated: !resend });
}

// ── Context Email Helpers ─────────────────────────────────────

export async function sendRegistrationConfirmEmail(to: string, eventTitle: string) {
  const subject = `Registration Confirmed: ${eventTitle}`;
  const html = `
    <h2>You are Registered!</h2>
    <p>Hi there,</p>
    <p>This email confirms your registration for the upcoming CAADS event: <strong>${eventTitle}</strong>.</p>
    <p>Please log in to your dashboard to view the schedule, venue details, and prepare your check-in QR badge.</p>
    <br/>
    <p>Best regards,<br/>CAADS Core Team</p>
  `;
  await sendEmail({ to, subject, html, template: "registration_confirm", metadata: { eventTitle } });
}

export async function sendEventReminderEmail(to: string, eventTitle: string, eventDate: string) {
  const subject = `Reminder: ${eventTitle} is tomorrow!`;
  const html = `
    <h2>Upcoming Event Reminder</h2>
    <p>Hi there,</p>
    <p>This is a quick reminder that the event <strong>${eventTitle}</strong> is scheduled for tomorrow (${eventDate}).</p>
    <p>Be ready to scan the check-in QR code during the session to register your attendance.</p>
    <br/>
    <p>Best regards,<br/>CAADS Core Team</p>
  `;
  await sendEmail({ to, subject, html, template: "event_reminder", metadata: { eventTitle, eventDate } });
}

export async function sendAttendanceStatusEmail(to: string, eventTitle: string, status: "approved" | "rejected") {
  const subject = `Attendance Status Updated: ${eventTitle}`;
  const html = `
    <h2>Attendance Verdict</h2>
    <p>Hi there,</p>
    <p>Your attendance claim for <strong>${eventTitle}</strong> has been updated to: <strong style="color: ${status === "approved" ? "green" : "red"}">${status.toUpperCase()}</strong>.</p>
    <p>Check your Student Dashboard for more details.</p>
    <br/>
    <p>Best regards,<br/>CAADS Core Team</p>
  `;
  await sendEmail({ to, subject, html, template: "attendance_update", metadata: { eventTitle, status } });
}

export async function sendVolunteerInviteEmail(to: string, eventTitle: string, role: string) {
  const subject = `Volunteer Invitation: ${eventTitle}`;
  const html = `
    <h2>Volunteer Assignment Request</h2>
    <p>Hi there,</p>
    <p>You have been invited to serve as a <strong>${role}</strong> for the upcoming event <strong>${eventTitle}</strong>.</p>
    <p>Please log in to your Volunteer Portal to accept or decline the request.</p>
    <br/>
    <p>Best regards,<br/>CAADS Core Team</p>
  `;
  await sendEmail({ to, subject, html, template: "volunteer_invite", metadata: { eventTitle, role } });
}

export async function sendMeetingMinutesEmail(to: string, meetingTitle: string, minutesHtml: string) {
  const subject = `Meeting Minutes: ${meetingTitle}`;
  const html = `
    <h2>Meeting Minutes Summary</h2>
    <p>Hi there,</p>
    <p>Below are the refined minutes and action items for the meeting <strong>${meetingTitle}</strong>:</p>
    <hr/>
    <div style="font-family: sans-serif; line-height: 1.6;">
      ${minutesHtml}
    </div>
    <hr/>
    <br/>
    <p>Best regards,<br/>CAADS Core Team</p>
  `;
  await sendEmail({ to, subject, html, template: "meeting_minutes", metadata: { meetingTitle } });
}
