# CAADS Platform

**Christite Association for Artificial Intelligence & Data Science**

A full-stack university club management platform serving four user roles: `student`, `volunteer`, `core_team`, and `admin`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, TypeScript strict mode) |
| Styling | Tailwind CSS (custom design tokens) |
| Database | Supabase (Postgres + RLS + Auth) |
| Session | `@supabase/ssr` (httpOnly cookies) |
| Email | Resend |
| Cron | Vercel Cron Jobs |
| AI | Gemini API (function calling) |
| Exports | ExcelJS (.xlsx) |
| QR Codes | `qrcode` (generate) + `html5-qrcode` (scan) |
| Validation | Zod (server-side on every form) |

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)
- A Resend account (free tier works)
- A Google AI API key (for the AI assistant)

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:
```bash
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (**server only**) |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `RESEND_FROM_EMAIL` | Sender address (e.g. `noreply@caads.in`) |
| `GEMINI_API_KEY` | Google Gemini API key |
| `NEXT_PUBLIC_APP_URL` | Full production URL (e.g. `https://caads.in`) |
| `CRON_SECRET` | Random secret string (protects `/api/cron/*`) |
| `CONTACT_FORM_EMAIL` | Email that receives contact form submissions |

### 3. Apply database migrations

In your Supabase dashboard → SQL Editor, run each file in order:
```
backend/supabase/migrations/001_initial_schema.sql
backend/supabase/migrations/002_rls_policies.sql
backend/supabase/migrations/003_auth_triggers.sql
backend/supabase/migrations/004_views.sql
backend/supabase/migrations/005_site_settings.sql
backend/supabase/migrations/006_rate_limit_events.sql
```

### 4. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Role Guide

| Role | What they can do |
|------|-----------------|
| `student` | Browse events, register, self-claim attendance, request yellow forms, view own dashboard |
| `volunteer` | Student + accept/decline event assignments, duty attendance tracking |
| `core_team` | Manage events (create/edit/QR), select volunteers, approve attendance, run meetings, use AI assistant, manage documents |
| `admin` | core_team + manage member roles, configure site settings, full audit visibility |

### `is_staff` flag
`is_staff` (boolean on `profiles`) is separate from `role`. Controls who gets a **personal QR badge** — volunteers, core_team, and admin qualify. Students do not.

---

## Folder Structure

```
frontend/
├── app/                    # Next.js App Router routes
│   ├── (auth)/             # Login & Signup pages (centered card layout)
│   ├── (portal)/           # Student dashboard + volunteer portal
│   │   ├── dashboard/      # /dashboard, /dashboard/events/[id], /dashboard/profile
│   │   └── volunteer/      # /volunteer, /volunteer/events/[id], /volunteer/yellow-forms
│   ├── admin/              # Leader & admin portal
│   │   ├── events/         # Event management, volunteer selection, attendance
│   │   ├── meetings/       # Meeting management, minutes, attendance
│   │   ├── scan/           # QR Scan Mode (staff + event QR)
│   │   ├── assistant/      # AI assistant (Gemini function calling)
│   │   ├── members/        # Member directory — admin only
│   │   └── settings/       # Site settings + mail audit — admin only
│   ├── api/                # API route handlers
│   │   ├── cron/           # Vercel cron jobs (reminders + keepalive)
│   │   └── export/         # Excel export endpoint (?event_id / ?meeting_id / ?type)
│   ├── auth/               # Auth callbacks (signout POST, OAuth callback)
│   ├── events/             # Public events calendar + event detail
│   └── id/                 # Public profile card (/id/[user_id]/[key])
│
├── components/
│   ├── layout/             # Header (with ARIA), footer, public-layout wrapper
│   ├── ui/                 # Reusable UI primitives: Button, Badge
│   └── role-gate.tsx       # Client-side role gate component
│
├── lib/
│   ├── supabase/           # Client/server Supabase helpers, auth utilities
│   ├── ai/                 # Gemini function-calling setup (query + drafting)
│   ├── export/             # buildEventMultiSheetExport, buildYellowFormsExport, buildMeetingAttendanceExport
│   ├── qr/                 # QR generation + parsing helpers
│   ├── mail.ts             # Transactional email via Resend
│   ├── rate-limit.ts       # Per-user/IP rate limiting (registration, self-claim, yellow forms)
│   ├── site-settings.ts    # Site settings read/write
│   └── utils.ts            # cn() — clsx + tailwind-merge
│
├── types/
│   └── database.ts         # TypeScript types for all DB tables and views
│
├── middleware.ts            # Session refresh middleware + basic route protection
└── vercel.json             # Cron job schedule configuration
```

---

## Security Model

- **RLS on every table** — policies are aligned to the role model in AGENTS.md
- **Role checks server-side only** — `getRole()` / `getProfile()` in server components and API routes
- **Sessions via httpOnly cookies** — `@supabase/ssr`, never `localStorage`
- **QR secrets** generated with `crypto.randomUUID()` (CSPRNG), rotatable from the admin panel
- **Signup restricted** to `@christuniversity.in` email domain, enforced server-side in the auth flow
- **Self-claim status always `pending`** server-side — client-submitted `status` field ignored
- **Rate limiting** — event registration (5/10 min), self-claim (3/5 min), yellow forms (2/10 min)
- **Budget / requirements** excluded from all student/volunteer-facing queries via the `events_public` view

---

## Design System

Design tokens are defined as CSS variables and referenced through Tailwind config:

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#0A0A0A` | Primary background |
| `--bg-secondary` | `#151515` | Cards, sections |
| `--gold` | `#C9A227` | Primary accent |
| `--gold-bright` | `#E8B93E` | Hover / highlight |
| `--ivory` | `#F2EDE4` | Primary text |
| `--muted` | `#B8B2A7` | Secondary text |
| `--border-gold` | `#7A5C1E` | Dividers |

Fonts: **Space Grotesk** (display), **IBM Plex Sans** (body), **IBM Plex Mono** (data/stats).

---

## Deployment (Vercel)

1. Connect the `frontend/` directory as your Vercel project root
2. Set all environment variables in Vercel settings
3. Push to `main` — Vercel auto-deploys
4. **Cron jobs** run automatically per `vercel.json`:
   - `/api/cron/reminders` — daily at 9 AM UTC
   - `/api/cron/keepalive` — every 6 days (prevents Supabase free-tier pause)

---

## Available Routes

| Route | Access |
|-------|--------|
| `/` | Public |
| `/events`, `/events/[id]` | Public |
| `/login`, `/signup` | Public |
| `/id/[user_id]/[key]` | Public (personal badge card) |
| `/review` | Authenticated students |
| `/dashboard/*` | `student`+ |
| `/volunteer/*` | `volunteer`+ |
| `/admin/*` | `core_team`+ |
| `/admin/members`, `/admin/settings` | `admin` only |
