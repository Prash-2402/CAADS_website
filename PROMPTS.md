# CAADS Platform — Build Prompts

Read `AGENTS.md` first and follow it strictly for every prompt below.

Use these prompts **in order**, one at a time, in a fresh Claude Code session (or one continuous session, completing and testing each step before moving to the next). Each prompt assumes everything before it is done and working.

---

## Phase 1 — Foundation

### 00 — Project setup
Set up a new Next.js 14 project (App Router, TypeScript strict mode, Tailwind CSS, ESLint, Prettier). Install `zod`, `date-fns`, `@supabase/ssr`, `@supabase/supabase-js`. Set up the folder structure exactly as defined in `AGENTS.md` under Architecture Guidelines. Create a `.env.local.example` listing every environment variable we'll need across the whole project (Supabase URL/anon key/service role key, Resend key, Gemini key, Google Drive credentials) even though most won't be used yet — this is our single reference for secrets going forward.

### 01 — Design tokens & Tailwind config
Implement the design token system from `AGENTS.md` (Styling Rules) as CSS variables, wired into `tailwind.config.ts` theme extension. Set up the suggested type pairing (display/body/utility fonts) via `next/font`. Build a small `/style-guide` internal-only route (not linked in nav) rendering color swatches, type scale, and button/card states — this is our visual reference for every feature after this, delete or gate it before final launch.

### 02 — Supabase project & schema
Create the Supabase project. Write SQL migrations for every table defined in `AGENTS.md` (`profiles`, `events`, `volunteer_assignments`, `attendance`, `yellow_forms`, `meetings`, `meeting_attendance`, `meeting_minutes`, `grievances`, `documents`, `mail_log`). Include a `handle_new_user()` trigger that creates a `profiles` row on signup, defaulting `role='student'`, `is_staff=false`. Do not write RLS policies yet — that's the next prompt, kept separate so schema and security are reviewed independently.

### 03 — RLS policies
For every table from prompt 02, write and apply RLS policies matching the Visibility Rules in `AGENTS.md`: users read/write their own rows where applicable; `core_team`/`admin` get broader read/write per the role model; budget/requirements columns on `events` must not be selectable by non-leader roles (use a view or column-level security, not just app-layer filtering). Write a short test script (can be manual SQL or a test file) that verifies a `student` role genuinely cannot read another user's `attendance` row or an event's `budget` column.

### 04 — Auth flow
Implement signup/login using Supabase Auth via `@supabase/ssr`, restricted server-side to the college email domain (make the domain a config value, not hardcoded). Sessions in httpOnly cookies. Build `/login`, `/signup`, and a `RoleGate` helper/component usable in both server components and API routes to guard access by role.

---

## Phase 2 — Public site

### 05 — Marketing home
Build the single scrolling home page (`/`): Hero → About → Highlights → Team → Contact, anchor-linked nav (`#about`, `#highlights`, `#team`, `#contact`). Content can be hardcoded in `data/` for now (team bios, highlights) — do not wire to the database yet unless a table already exists for it. Match the CAADS visual identity (gold/black, laurel-adjacent motifs are fine to reference subtly, don't reproduce the logo's exact wreath graphic).

### 06 — Events calendar
Build `/events`: a month calendar (default view) using `date-fns`, marking days with events. Clicking a day expands an inline panel showing that day's event(s) — title, time, speaker, short description — without navigating away. Each event links to `/events/[id]` for a full, shareable page. Only `is_public` events and public-visible fields (never budget/requirements) are queried here.

### 07 — Event detail & registration
Build `/events/[id]`: full event info (public fields only), a "Register" CTA that prompts login if logged out, and a registration form if logged in. Registration writes to `event_registrations`-equivalent (add this table if not already in schema — one row per user per event, with a `form_response jsonb` for any event-specific fields). Show "Registration coming soon" state for events not yet open.

### 07a — Review form & contact form
Add two tables: `reviews` (user_id nullable, message, rating optional, created_at) and `contact_messages` (name, email, message, created_at). Wire the `#contact` section on the home page to an actual submission handler (server action or API route) that writes to `contact_messages`, validates with `zod`, and sends a notification email (stub until prompt 18 exists, then wire it properly). Build a `/review` route (or a reachable section from the dashboard) for the review form from the original notes — default to login-required unless told otherwise, since it ties feedback to a real member. Add `/admin/reviews` and `/admin/messages` as simple read-only lists so leaders can see what's been submitted.

---

## Phase 3 — Student & volunteer portals

### 08 — Student dashboard
Build `/dashboard`: shared shell for student + volunteer (per `AGENTS.md` layout hierarchy), sidebar links conditional on `is_staff`/role. Student view shows: my registrations, my attendance status per event, a way to request a yellow form for an event they're registered for.

### 09 — Volunteer portal
Extend the dashboard shell with volunteer-only views: events open for volunteering (available/not), my assignments with status (`invited`/`accepted`/`declined`) showing role + expected duration + coordinator contact, and accept/decline actions that update `volunteer_assignments`.

### 10 — Personal QR badges
Add `personal_qr_key` generation on `profiles` for any user with `is_staff=true`. Build `/id/[user_id]/[key]`: public route rendering the profile card (name, role, photo, socials only — verify against AGENTS.md visibility rules). Generate a downloadable QR image (via `qrcode`) encoding this URL, viewable from the user's own dashboard.

---

## Phase 4 — Leader/admin portal

### 11 — Admin shell & event management
Build `/admin` shell (role-gated: `core_team`/`admin` only, with `admin`-only links conditionally shown). Build event management: create/edit tentative schedule, edit all fields including budget/requirements (leader-only, confirm this never leaks via any shared component also used on the public event page). Generate/rotate each event's `qr_secret` and its QR image.

### 12 — Volunteer selection
Build the volunteer management view: list of volunteers with basic activity stats (most active), a selection flow (pick volunteer, set role + expected duration), AI-drafted invite email (stub the AI call for now if prompt 17 hasn't been built yet, wire it properly once it has been), and send — writes to `volunteer_assignments` with `status='invited'`, visible instantly in that volunteer's dashboard. Support changing/reassigning after initial selection.

### 13 — QR Scan Mode & attendance
Build `/admin/scan`: pick an active event from a dropdown, open device camera (via the scanning library), and handle two scan targets on the same screen: (a) an event-QR scan → marks the scanning attendee present (`method='qr_self'`), (b) a personal badge scan → marks that staff member present for the selected event (`method='staff_scan'`, `scanned_by` recorded). Build the self-claim fallback flow for students/volunteers who miss the scan (`status` forced `pending` server-side), and an approval queue in `/admin` for `core_team`/`admin` to approve/reject pending claims.

### 14 — Yellow forms
Build the yellow form request flow (student/volunteer side: request for an event, select periods P1–P6) and the approval flow (leader side: approve/reject, method `qr`/`manual`). Status always starts `pending` server-side.

### 15 — Meetings module
Build `/admin/meetings`: schedule meetings (title, date, agenda), track attendance (QR/manual, same shared pattern as event attendance), collect grievances/questions tied to a meeting, and a raw-notes field per meeting that will feed into prompt 16's AI refinement.

### 16 — AI assistant
Set up Gemini function calling. Define server-side functions for query mode (`getEventAttendance`, `getVolunteerStatus`, `getYellowFormStats`, etc. — add more as needed) that Gemini can call; it never generates raw SQL. Build the leader-only `/admin/assistant` chat UI for query mode. Add drafting mode: refine a meeting's raw notes into `ai_refined_notes`, and draft the volunteer invite email from prompt 12 for the leader to review before sending — never auto-send anything the AI drafts.

### 17 — Documents (Drive)
Build a simple "add Drive link" flow per event/meeting, storing metadata in the `documents` table. List documents grouped by event/meeting in the admin panel, no file upload/storage on our end.

---

## Phase 5 — Communication & exports

### 18 — Email notifications
Set up Resend. Build transactional emails for: registration confirmation, event reminder (needs prompt 19's cron), attendance approved/rejected, volunteer invite (from prompt 12), meeting minutes sent (from prompt 15/16). Log every send to `mail_log`.

### 19 — Cron jobs
Set up Vercel Cron for: (a) the 24h-before event reminder job, (b) a Supabase keep-alive ping to prevent free-tier auto-pause. Document the schedule and what each job does in a comment at the top of its route file.

### 20 — Excel exports
Build the shared `buildExcelExport()` helper using `exceljs`. Wire it into: event attendance, meeting attendance, volunteer duty attendance, and yellow forms (single "Periods Missed" column, comma-joined). Add a per-event multi-sheet export option (Registrations / Attendance / Yellow Forms as separate tabs in one workbook).

---

## Phase 6 — Hardening & launch

### 21 — Security review pass
Go through every table and confirm RLS policies match `AGENTS.md` exactly. Confirm no client-trusted status/role fields anywhere. Confirm rate limiting on registration, self-claim, and yellow-form endpoints. Confirm budget/requirements never appear in any student/volunteer-facing API response (check network responses, not just UI rendering).

### 22 — Admin: roles & settings
Build `admin`-only views: role management (promote/demote between `student`/`volunteer`/`core_team`/`admin`), member directory with search, and a settings panel for toggling event visibility and editing About/Team/Highlights content without a redeploy (simplest version: a settings table read by the marketing pages instead of hardcoded `data/` content). Also build `/admin/audit`: a read-only view of `mail_log` (filterable by type/date/recipient) so leaders can actually check whether a given email sent, instead of the table existing with no way to look at it.

### 23 — Deployment
Deploy to Vercel. Set all environment variables from the `.env.local.example` reference. Verify the Supabase keep-alive cron is live. Do a full walkthrough as each of the four roles (student, volunteer, core_team, admin) to confirm every route in the sitemap works end-to-end before considering this launched.

---

## Coverage check

Every feature from the original notes and the full feature list is represented above, including ones easy to lose track of:
- Review form → `07a`, `/review`
- Contact form → `07a`, `#contact` handler
- Mail/audit log viewing → `22`, `/admin/audit`

## Notes for whoever runs these prompts

- Complete and test each numbered prompt before moving to the next — later prompts assume earlier ones work.
- If a prompt surfaces an ambiguity not covered in `AGENTS.md`, resolve it the way `AGENTS.md`'s Decision Making section says: state an assumption and proceed for non-security ambiguity, ask before proceeding for anything touching security or data visibility.
- Phase 2 (Public site) and Phase 3 (Student/volunteer portals) can be reordered or interleaved if useful, but Phase 1 must come first (nothing works without schema + RLS + auth) and Phase 6 must come last (hardening needs everything else built to review against).
