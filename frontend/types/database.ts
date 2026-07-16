export type UserRole = "student" | "volunteer" | "core_team" | "admin";

export type Profile = {
  id: string;
  full_name: string;
  reg_no: string | null;
  role: UserRole;
  is_staff: boolean;
  personal_qr_key: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Event = {
  id: string;
  title: string;
  date: string;
  time: string | null;
  speaker: string | null;
  description: string | null;
  venue: string | null;
  poster_url: string | null;
  // leader-only — never present in student/volunteer-facing queries
  budget?: number | null;
  requirements?: string | null;
  is_public: boolean;
  qr_secret: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

// Public-safe event type — no budget/requirements
export type EventPublic = Omit<Event, "budget" | "requirements" | "qr_secret">;

export type EventRegistration = {
  id: string;
  event_id: string;
  user_id: string;
  form_response: Record<string, unknown> | null;
  registered_at: string;
};

export type VolunteerStatus = "invited" | "accepted" | "declined";

export type VolunteerAssignment = {
  id: string;
  event_id: string;
  user_id: string;
  role: string | null;
  expected_duration: string | null;
  status: VolunteerStatus;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AttendanceMethod = "qr_self" | "self_claim" | "staff_scan";
export type AttendanceStatus = "pending" | "approved" | "rejected";

export type Attendance = {
  id: string;
  event_id: string;
  user_id: string;
  method: AttendanceMethod;
  status: AttendanceStatus;
  scanned_by: string | null;
  created_at: string;
  updated_at: string;
};

export type YellowFormMethod = "qr" | "manual";
export type YellowFormStatus = "pending" | "approved" | "rejected";

export type YellowForm = {
  id: string;
  user_id: string;
  event_id: string;
  periods: string[];
  method: YellowFormMethod;
  status: YellowFormStatus;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Meeting = {
  id: string;
  title: string;
  date: string;
  agenda: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type MeetingAttendance = {
  id: string;
  meeting_id: string;
  user_id: string;
  method: AttendanceMethod;
  status: AttendanceStatus;
  created_at: string;
};

export type MeetingMinutes = {
  id: string;
  meeting_id: string;
  raw_notes: string | null;
  ai_refined_notes: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type GrievanceStatus = "open" | "resolved";

export type Grievance = {
  id: string;
  meeting_id: string | null;
  user_id: string;
  message: string;
  status: GrievanceStatus;
  created_at: string;
  updated_at: string;
};

export type Document = {
  id: string;
  event_id: string | null;
  meeting_id: string | null;
  drive_link: string;
  uploaded_by: string | null;
  created_at: string;
};

export type MailLog = {
  id: string;
  recipient: string;
  subject: string;
  template: string;
  metadata: Record<string, unknown> | null;
  sent_at: string;
};

// ── Supabase Database type (used by createClient generics) ────
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      events: { Row: Event; Insert: Partial<Event>; Update: Partial<Event> };
      event_registrations: { Row: EventRegistration; Insert: Partial<EventRegistration>; Update: Partial<EventRegistration> };
      volunteer_assignments: { Row: VolunteerAssignment; Insert: Partial<VolunteerAssignment>; Update: Partial<VolunteerAssignment> };
      attendance: { Row: Attendance; Insert: Partial<Attendance>; Update: Partial<Attendance> };
      yellow_forms: { Row: YellowForm; Insert: Partial<YellowForm>; Update: Partial<YellowForm> };
      meetings: { Row: Meeting; Insert: Partial<Meeting>; Update: Partial<Meeting> };
      meeting_attendance: { Row: MeetingAttendance; Insert: Partial<MeetingAttendance>; Update: Partial<MeetingAttendance> };
      meeting_minutes: { Row: MeetingMinutes; Insert: Partial<MeetingMinutes>; Update: Partial<MeetingMinutes> };
      grievances: { Row: Grievance; Insert: Partial<Grievance>; Update: Partial<Grievance> };
      documents: { Row: Document; Insert: Partial<Document>; Update: Partial<Document> };
      mail_log: { Row: MailLog; Insert: Partial<MailLog>; Update: Partial<MailLog> };
    };
    Views: {
      events_public: { Row: EventPublic };
    };
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      volunteer_status: VolunteerStatus;
      attendance_method: AttendanceMethod;
      attendance_status: AttendanceStatus;
      yellow_form_method: YellowFormMethod;
      yellow_form_status: YellowFormStatus;
      grievance_status: GrievanceStatus;
    };
  };
};
