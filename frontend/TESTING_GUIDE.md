# CAADS Platform — Comprehensive Testing Guide

This guide provides step-by-step instructions to test **every single feature** of the CAADS digital platform across all 4 user permission levels: `student`, `volunteer`, `core_team`, and `admin`.

---

## 📋 Test User Setup & Database Preparation

The login page (`/login`) includes **1-Click Quick Fill sample accounts** for all 4 user roles (`student`, `volunteer`, `core_team`, `admin`).

### Pre-Configured Sample Accounts

| Role Name | Email Address | Password | `profiles.role` | `is_staff` | Primary Testing Scope |
|-----------|---------------|----------|-----------------|------------|----------------------|
| **Admin User** | `admin@christuniversity.in` | `Password123!` | `admin` | `true` | Members directory, Role management, Site settings, Full audit |
| **Core Team Lead** | `coreteam@christuniversity.in` | `Password123!` | `core_team` | `true` | Event management, Volunteer selection, Meetings & AI assistant |
| **Volunteer Lead** | `volunteer.lead@christuniversity.in` | `Password123!` | `volunteer` | `true` | Volunteer portal, Duty assignment tracking & Yellow forms |
| **Event Volunteer** | `volunteer@christuniversity.in` | `Password123!` | `volunteer` | `true` | Assignment accept/decline & personal staff QR badge |
| **Regular Student** | `student@christuniversity.in` | `Password123!` | `student` | `false` | Event registration, Self-claim attendance & Student profile |
| **Participant Student** | `student2@christuniversity.in` | `Password123!` | `student` | `false` | Secondary student account for multi-user test flows |

> 💡 **Tip:** Click any sample login card on `/login` to auto-fill the email and password instantly. You can also seed these users into your Supabase database using `backend/supabase/seed.sql`.

---

## 1. 🌐 Public Marketing Site & Navigation

### Test 1.1: Single Scroll Home Page (`/`)
1. Open [http://localhost:3000](http://localhost:3000) while signed out.
2. Click **About**, **Highlights**, or **Team** in the top navigation header.
   - **Expected Result:** Smooth scrolls to the respective section (`#about`, `#highlights`, `#team`).
3. Click the **Events** link in the header.
   - **Expected Result:** Navigates to `/events`.
4. Submit the **Contact Form** at the bottom of the home page.
   - **Expected Result:** Form validates input and displays a success confirmation message.

### Test 1.2: Public Events Calendar & Details (`/events`, `/events/[id]`)
1. Navigate to `/events`.
2. View the calendar view; click on a day with an event.
   - **Expected Result:** Inline expansion showing the event summary without full page reload.
3. Click **View Details** on an event to deep-link to `/events/[id]`.
   - **Expected Result:** Displays public event details (Title, Date, Time, Venue, Speaker, Description).
   - **Security Check:** Verify **Budget** and **Requirements** fields are **NOT visible** anywhere in the DOM or API response.

### Test 1.3: Personal QR Badge Public Landing (`/id/[user_id]/[key]`)
1. Open a staff user's badge URL: `/id/[user_id]/[personal_qr_key]`.
2. **Expected Result:** Displays public profile card with Name, Role badge, Avatar, and Social links.
3. **Security Check:** Confirm email address, registration number, and private attendance history are **never rendered**.

---

## 2. 🔐 Authentication & Domain Enforcement

### Test 2.1: Signup Domain Restriction
1. Go to `/signup`.
2. Attempt to sign up using a generic email (e.g. `user@gmail.com`).
   - **Expected Result:** Blocked server-side with error: *"Only @christuniversity.in emails are allowed."*
3. Sign up using an authorized domain (e.g. `student.name@christuniversity.in`).
   - **Expected Result:** Registration proceeds and sends a confirmation email / logs in.

### Test 2.2: Sign In & Sign Out
1. Go to `/login`, enter credentials.
   - **Expected Result:** Redirects based on role (`/dashboard` for student/volunteer, `/admin` for core_team/admin).
2. Click **Sign Out** button in navigation or visit `/auth/signout`.
   - **Expected Result:** `httpOnly` session cookies cleared, redirected back to public home page.

---

## 3. 🎓 Student Portal (`/dashboard`)

### Test 3.1: Student Event Registration
1. Log in as a `student`.
2. Visit `/events/[id]`. Click **Register for Event**.
   - **Expected Result:** Confirmation banner appears; registration confirmation email is sent.
3. Rapidly click **Register** multiple times (>5 times in 10 mins).
   - **Expected Result:** Rate-limiting kicks in: *"Too many attempts. Please try again later."*

### Test 3.2: Self-Claim Event Attendance
1. Log in as a `student` registered for an active event.
2. Go to `/dashboard/events/[id]` or `/events/[id]/claim`.
3. Submit a self-claim attendance request.
   - **Expected Result:** Status is created as `pending`.
   - **Security Check:** Verify the client cannot force status to `approved`. The status MUST stay `pending`.

### Test 3.3: Student Profile & Badge Access
1. Visit `/dashboard/profile` as a `student` (`is_staff = false`).
   - **Expected Result:** Profile editing works, but **Personal QR Badge generation section is hidden**.

---

## 4. 🤝 Volunteer Portal (`/volunteer`)

### Test 4.1: Volunteer Assignment Accept/Decline
1. Log in as a `volunteer`.
2. Navigate to `/volunteer`. View assigned events under "My Assignments".
3. Click on an event `/volunteer/events/[id]`.
4. Click **Accept Assignment** or **Decline Assignment**.
   - **Expected Result:** Status updates dynamically to `accepted` or `declined`.

### Test 4.2: Request Yellow Form
1. Log in as a `volunteer`.
2. Navigate to `/volunteer/yellow-forms`.
3. Select an event, check period boxes (e.g. P2, P3), and submit the request.
   - **Expected Result:** Form submits and creates a request with `pending` status.
4. Try requesting a 3rd yellow form within 10 minutes.
   - **Expected Result:** Rate limiter blocks request with rate-limit error message.

### Test 4.3: Staff Personal QR Badge View
1. Visit `/dashboard/profile` as a `volunteer` (`is_staff = true`).
2. Click **Generate Badge**.
   - **Expected Result:** Client-side QR code generates with gold design theme; downloadable via **Download Badge**.

---

## 5. 🛡️ Leader & Admin Portal (`/admin`)

### Test 5.1: Event Management & Budget Privacy (`/admin/events`)
1. Log in as `core_team` or `admin`.
2. Go to `/admin/events/create`. Fill out title, date, time, venue, speaker, **Budget**, and **Requirements**.
3. Save event.
   - **Expected Result:** Event created. Budget & requirements stored securely.
4. Open the event page as a `student` or via public API.
   - **Security Check:** Ensure `budget` and `requirements` fields are absent from response.

### Test 5.2: Volunteer Selection & AI Email Draft (`/admin/events/[id]/volunteers`)
1. Log in as `core_team`.
2. Open `/admin/events/[id]/volunteers`.
3. Select volunteers from the list and assign roles (e.g., *Registration Desk*, *Stage Coordinator*).
4. Click **Draft Invite Email**.
   - **Expected Result:** Generates AI draft text. Shows review modal with **Edit** and **Send** options (never auto-sends without review).

### Test 5.3: Attendance Approval (`/admin/events/[id]/attendance`)
1. Open `/admin/events/[id]/attendance`.
2. View pending self-claims and staff scans.
3. Click **Approve** or **Reject** on a pending claim.
   - **Expected Result:** Record status updates immediately to `approved` or `rejected` with approver's user ID recorded.

### Test 5.4: QR Scan Mode (`/admin/scan`)
1. Open `/admin/scan` on a mobile device or desktop with camera.
2. Select target event and switch between **Camera Scan** and **Manual Scan**.
3. Scan a student's personal QR badge or event QR code.
   - **Expected Result:** Immediate validation notification: green flash for success (`approved`), red for invalid/unregistered.

### Test 5.5: Meetings & AI-Refined Minutes (`/admin/meetings/[id]`)
1. Open `/admin/meetings`. Create a meeting.
2. Mark member attendance and enter raw meeting notes.
3. Click **Refine Notes with AI**.
   - **Expected Result:** Gemini formats raw notes into structured Markdown meeting minutes.
4. Click **Send Minutes to Team**.
   - **Expected Result:** Emails structured minutes to attending members and logs to `mail_log`.

### Test 5.6: Yellow Form Approval & Excel Export (`/admin/yellow-forms`)
1. Open `/admin/yellow-forms`.
2. Approve or Reject student yellow form requests.
3. Click **Export to Excel**.
   - **Expected Result:** Downloads `.xlsx` spreadsheet formatted with full student details, event titles, and period lists.

### Test 5.7: AI Assistant (`/admin/assistant`)
1. Open `/admin/assistant` as `core_team` or `admin`.
2. Ask: *"What is the total attendance for our last event?"*
   - **Expected Result:** Uses Gemini function calling (`getEventAttendance`) and returns structured answer.
3. Ask: *"Draft an email inviting volunteers for the upcoming AI workshop."*
   - **Expected Result:** Enters **Drafting Mode**, displays editable draft preview before sending.

### Test 5.8: Member Directory & Role Management (`/admin/members`)
1. Log in as `admin`.
2. Open `/admin/members`. Search for a user.
3. Change a user's role (e.g., upgrade `student` to `volunteer` or toggle `is_staff`).
   - **Expected Result:** User role updates immediately in database; page revalidates.
4. Try accessing `/admin/members` logged in as `core_team`.
   - **Security Check:** Blocked with *403 / Access Denied* page.

### Test 5.9: Site Settings (`/admin/settings`)
1. Log in as `admin`.
2. Open `/admin/settings`. Toggle site maintenance mode or edit banner message.
   - **Expected Result:** Settings save to `site_settings` table and apply globally.

---

## 6. 📊 Excel Data Exports (`/api/export`)

Test all three export types via API / UI buttons:

1. **Event Attendance Export**: Click **Export Attendance** on `/admin/events/[id]/attendance`.
   - **URL:** `/api/export?type=event&event_id=[id]`
   - **Format:** Multi-sheet `.xlsx` file (Sheet 1: Summary, Sheet 2: Registrations, Sheet 3: Verified Attendance).
2. **Yellow Forms Export**: Click **Export All** on `/admin/yellow-forms`.
   - **URL:** `/api/export?type=yellow_forms`
   - **Format:** `.xlsx` containing student registration numbers, names, events, and approved period arrays.
3. **Meeting Attendance Export**: Click **Export Attendance** on `/admin/meetings/[id]`.
   - **URL:** `/api/export?type=meeting&meeting_id=[id]`
   - **Format:** `.xlsx` containing meeting topic, date, attendee list, and attendance status.

---

## 7. ⏱️ Scheduled Jobs (Vercel Cron)

Test cron endpoints locally using the `CRON_SECRET` header:

### Test 7.1: Event Reminders Cron
```bash
curl -X GET "http://localhost:3000/api/cron/reminders" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```
- **Expected Result:** Queries upcoming events in the next 24-48h window and sends reminder emails to registered students. Returns `{ "success": true, "processed": N }`.

### Test 7.2: Supabase Keep-Alive Ping
```bash
curl -X GET "http://localhost:3000/api/cron/keepalive" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```
- **Expected Result:** Performs a lightweight `head` query on `profiles` to prevent Supabase free-tier project auto-pausing. Returns `{ "status": "ok" }`.

---

## ✅ Summary Checklist

- [ ] Public site single scroll & calendar view work correctly
- [ ] Signups restricted strictly to `@christuniversity.in` domain
- [ ] Student event registration & self-claim force status to `pending`
- [ ] Volunteer yellow form requests and assignment accept/decline work
- [ ] Core team can manage events, run meetings, approve attendance, and use AI assistant
- [ ] Admin panel gates `/admin/members` and `/admin/settings` exclusively to `admin`
- [ ] Event budget & requirements remain strictly private from student/volunteer queries
- [ ] Rate limits actively block spam attempts on self-claim, registration, and yellow forms
- [ ] All 3 Excel export formats generate valid `.xlsx` workbooks
- [ ] Production build (`npm run build`) compiles with zero errors and zero warnings
