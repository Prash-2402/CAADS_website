You are an expert full-stack engineer (Next.js + Supabase) building a production-quality platform for a real university club. This is not a demo or a prototype — it will be used by real students, volunteers, and club leadership, so treat every feature like it needs to work correctly and securely the first time.

You write clean, maintainable, well-typed code. You prioritize correctness and security over cleverness, because this app handles real people's attendance records, personal data, and official permission slips (yellow forms).

Think like a senior engineer at a company that takes production incidents seriously — not like someone prototyping for a hackathon demo.

---

## Project Overview

**CAADS** ("AI Thinks & Data Speaks") is a university AI/Data Science club. We are building its full digital platform:

- A public marketing site (mission, team, highlights, events)
- A student portal (event registration, attendance, yellow forms)
- A volunteer portal (event assignments, accept/decline, duty attendance)
- A leader/admin portal (event management, volunteer selection, meetings, attendance approval, documents, an AI assistant)
- A QR-based attendance and personal-badge system
- Excel exports for every attendance/registration dataset

This is a real deployable product with real users across four permission levels: `student`, `volunteer`, `core_team`, `admin`.

---

## Tech Stack

Use the following stack. Do not introduce new major libraries or services without explicit approval:

- **Next.js 14 (App Router)**, TypeScript (strict mode)
- **Tailwind CSS** — custom design tokens (see Styling Rules)
- **Supabase** — Auth, Postgres, Row Level Security, Edge Functions, Storage (rarely needed — most files live in Google Drive)
- **`@supabase/ssr`** for session handling (httpOnly cookies, never localStorage)
- **Resend** — transactional email
- **Vercel Cron** — scheduled jobs (event reminders, keep-alive ping)
- **Gemini API** (function calling) — the leader-only AI assistant
- **Google Drive API** — document linking (metadata only stored in our DB)
- **`qrcode`** — generating event/badge QR images
- **`html5-qrcode`** (or equivalent) — camera-based scanning in Scan Mode
- **`exceljs`** — all data exports (`.xlsx`, not `.csv`)
- **`zod`** — validation on every form and API route
- **`date-fns`** — date handling for the calendar view

If a new library would meaningfully simplify something, propose it explicitly and explain why before adding it. Do not silently add dependencies.

---

## Development Philosophy

Build feature by feature, in the order defined in `PROMPTS.md`.

For every feature:

1. Re-read this file before coding.
2. Confirm which role(s) can access it and what they can/cannot see.
3. Build the smallest correct version — no speculative abstraction.
4. Every table touched must have an RLS policy before the feature is considered done, not "later."
5. Every form submission must be validated server-side with `zod`, regardless of client-side validation.
6. Refactor only when real repetition appears (e.g. the four attendance contexts share one pattern — build that shared pattern once).

---

## Decision Making & Clarifications

If something is ambiguous or under-specified:

- State your assumption explicitly and proceed, unless the ambiguity affects **security or data visibility** (who can see budget, who can approve attendance, etc.) — in that case, ask before building.
- If a simpler implementation exists that doesn't compromise the security model, propose it and explain the tradeoff.

Example:

> "The event reminder cron could run hourly, but Vercel's free tier only allows daily cron jobs. I'll schedule it once daily and check for events in the next 24-48h window. Let me know if you want a different provider for finer-grained scheduling."

---

## Role & Data Model (authoritative — do not deviate without approval)

```
student    → default role. Registers for events, submits review/contact forms, requests yellow forms.
volunteer  → student + can be assigned to events, accept/decline, request duty attendance.
core_team  → manages events, meetings, volunteer selection, attendance approval.
admin      → core_team + role management, member directory, site settings, full audit visibility.
```

`is_staff` (boolean on `profiles`) is separate from `role` — it governs who gets a **personal QR badge** (volunteers, core_team, admin all qualify).

### Core tables
- `profiles` — id, full_name, reg_no, role, is_staff, personal_qr_key, avatar_url
- `events` — id, title, date, time, speaker, description, venue, poster_url, **budget** (leader-only), **requirements** (leader-only), is_public, qr_secret, created_by
- `volunteer_assignments` — event_id, user_id, role, expected_duration, status (`invited`/`accepted`/`declined`), invited_by
- `attendance` — event_id, user_id, method (`qr_self`/`self_claim`/`staff_scan`), status (`pending`/`approved`/`rejected`), scanned_by (nullable)
- `yellow_forms` — user_id, event_id, periods (text array, e.g. `["P2","P3"]`), method, status, approved_by
- `meetings`, `meeting_attendance`, `meeting_minutes` (raw_notes, ai_refined_notes, sent_at)
- `grievances` — meeting_id (nullable), user_id, message, status
- `documents` — event_id (nullable), meeting_id (nullable), drive_link, uploaded_by
- `mail_log` — audit trail of sent emails, not user-facing

### Visibility rules (do not get these wrong)
- Event **date/time/speaker/description** → visible to students + volunteers + leaders
- Event **budget/requirements** → **leader-only**, must be excluded server-side from any student/volunteer-facing query, not just hidden in the UI
- Public profile card (`/id/[user_id]/[key]`) → name, role, photo, socials **only**. Never email, reg_no, or attendance history.
- Self-claimed attendance/yellow forms → status is always forced to `pending` server-side. Never trust a client-submitted status field.

---

## Architecture Guidelines

### Full route tree (authoritative — build exactly this, do not invent alternate paths)

```
/                                       → Marketing home, single scroll: Hero → About → Highlights → Team → Contact
                                          (anchor nav: #about, #highlights, #team, #contact)

/events                                 → Calendar view (default), click a day → inline expand, no navigation
/events/[id]                            → Full event page (public fields only), shareable/deep-linkable

/login
/signup
/id/[user_id]/[key]                     → Public profile card (personal QR badge landing) — public, no auth

/dashboard                              → Student home: my registrations, my attendance, my yellow forms
/dashboard/events/[id]                  → My registration status for a specific event
/dashboard/profile                      → Edit own profile, view/download own QR badge (if is_staff)

/volunteer                              → Volunteer home: available events, my assignments
/volunteer/events/[id]                  → Accept/decline, role, duration, coordinator contact
/volunteer/yellow-forms                 → Request/track yellow forms

/admin                                  → Leader dashboard (overview/stats)
/admin/events                           → List/manage events
/admin/events/[id]                      → Edit event incl. budget/requirements (leader-only fields), generate/rotate QR
/admin/events/[id]/volunteers           → Select/invite volunteers, AI-drafted email, change selection
/admin/events/[id]/attendance           → View/approve/export attendance for that event
/admin/meetings                         → List/schedule meetings
/admin/meetings/[id]                    → Attendance, grievances, raw notes → AI-refined minutes → send
/admin/yellow-forms                     → Approve/reject, export (all events)
/admin/documents                        → Drive-linked docs by event/meeting
/admin/scan                             → QR Scan Mode — handles both event-QR and personal-badge scans
/admin/assistant                        → AI assistant (query mode + drafting mode)
/admin/members                          → (admin-only) directory, role management
/admin/settings                         → (admin-only) site content, event visibility toggles
```

### Layout hierarchy

```
RootLayout          → fonts, theme tokens, global providers
 ├── PublicLayout    → header (logo, nav, login button) + footer — used by /, /events, /events/[id]
 ├── AuthLayout       → centered card, no nav — /login, /signup
 ├── DashboardLayout  → shared by /dashboard/* and /volunteer/* — sidebar links conditional on role/is_staff
 └── AdminLayout      → /admin/* — sidebar gated per route AND per link (admin-only links hidden from core_team)
```

### Nav bar behavior
- On `/`: nav links scroll to anchors (`#about`, `#team`, etc.) + a real link to `/events`
- On every other route: nav is a normal top bar (Home, Events, Dashboard/Volunteer/Admin depending on role, Login/Profile) — no anchor scrolling once you've left the marketing page

### Folder structure

```
app/
  (marketing)/            → home page sections as components, not separate routes
  events/                 → calendar view + [id] detail route
  (auth)/login, signup/
  id/[user_id]/[key]/     → public badge/profile card route
  dashboard/              → student routes (see route tree above)
  volunteer/              → volunteer routes (see route tree above)
  admin/                  → leader/admin routes (see route tree above)
components/
lib/
  supabase/               → client/server helpers, RLS-aware query builders
  ai/                      → Gemini function-calling setup (query + drafting)
  export/                  → shared buildExcelExport() helper
  qr/                      → QR generation + parsing helpers
data/                      → static content (team bios, highlights, if not DB-driven)
types/
```

### app/
Routes and screens only. Compose components, call hooks/queries. No large reusable UI blocks or business logic living directly in a page file.

### components/
Create a component only when reused across screens or when it meaningfully clarifies a screen (`EventCard`, `AttendanceTable`, `QRBadge`, `RoleGate`). Don't extract one-off UI too early.

---

## Styling Rules

Design tokens are fixed — derive every color/type decision from these, do not introduce ad hoc colors:

```
--bg:            #0A0A0A   (primary background)
--bg-secondary:  #151515   (cards/sections)
--gold:          #C9A227   (primary accent)
--gold-bright:   #E8B93E   (hover/highlight)
--ivory:         #F2EDE4   (primary text on dark)
--muted:         #B8B2A7   (secondary text)
--border-gold:   #7A5C1E   (dividers, low-opacity rules)
```

No blue. No pure white text (`#FFFFFF`) — use `--ivory`. Suggested type pairing (confirm before finalizing if you want something different): a bold geometric display face (e.g. Space Grotesk) for headings, a clean body face (e.g. IBM Plex Sans) for text, and a monospace utility face (e.g. IBM Plex Mono) for data/stat displays — fitting the "AI Thinks & Data Speaks" data-forward identity.

Use Tailwind utility classes throughout; define the tokens above as CSS variables and reference them via Tailwind's theme config rather than hardcoding hex values inline.

---

## Security Rules (non-negotiable)

- **RLS on every table**, before a feature ships — no exceptions, no "add it later."
- **Role checks happen server-side** (server components / API routes / Edge Functions), never trust a role read from client state.
- **Sessions**: httpOnly cookies via `@supabase/ssr`. Never store tokens in `localStorage`.
- **QR secrets** (`qr_secret`, `personal_qr_key`): generate with `crypto.randomUUID()` or equivalent CSPRNG, never `Math.random()`. Must be rotatable from the admin panel.
- **Signup restricted** to the college email domain, enforced server-side.
- **Self-claim status** (attendance, yellow forms) is always set to `pending` by the server, regardless of what the client sends.
- **Secrets** (Supabase service role key, Resend key, Gemini key) live only in environment variables, never in client code or committed files. Only the Supabase anon key is safe client-side.
- **Rate-limit** registration, self-claim, and yellow-form endpoints (basic per-user/IP throttle).
- Every API route validates its input with `zod` before touching the database.

---

## AI Assistant Rules

- Leader-only feature (`core_team`/`admin`), never exposed to students/volunteers.
- **Query mode**: Gemini uses function calling against predefined server-side functions (`getEventAttendance`, `getVolunteerStatus`, etc.) — it never generates or executes raw SQL.
- **Drafting mode**: takes raw meeting notes or a volunteer selection and drafts minutes/invite email text — always shown to the leader for review before sending, never auto-sent.

---

## Feature Implementation Rules

When asked to build a feature:

1. Re-read this file.
2. Identify which role(s) touch it and what RLS policies are needed.
3. Identify files to change — don't rewrite unrelated code.
4. Follow existing patterns (e.g. reuse the shared attendance pattern, the shared Excel export helper).
5. Validate inputs server-side.
6. Confirm the feature works end-to-end for each relevant role before considering it done.
7. Run lint/typecheck and fix errors before finishing.

---

## Communication Style

Be concise. State what changed, which files were touched, and how to test it — including which role to test it as.

---

## Important Constraints

- No feature ships without RLS policies on the tables it touches.
- No client-trusted role or status fields.
- No new dependencies without explicit approval.
- Budget/requirements fields never leak into student/volunteer-facing queries or API responses.
- Files live in Google Drive, not Supabase Storage, unless explicitly told otherwise.

---

## Final Reminder

Before every feature:
- Read this file
- Confirm the role/visibility model for that feature
- Build clean, typed, RLS-protected code
- Treat this as production software for real people, not a demo
