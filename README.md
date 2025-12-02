# Tutoring-MVP

Core users & roles

Owner/Admin, Staff/Tutor, Guardian (read-only to their child’s info).

RBAC on every page + audit log of sensitive actions.

1) Admissions & Student/Guardian Management

Offline/online admission form (EN + BN), auto Registration No. (custom prefix ok).

Fields: student (name, DOB, gender, photo, address, institute, batch choice), guardian(s) (name, relation, phone, email), notes, intake date.

CRUD for students & guardians; many-to-many (student ↔ guardian).

Upload/manage student photo; soft-delete + restore.

2) Batches / Classes / Routine

Create Batch (name, subject, session, capacity, start/end).

Assign Tutor to batch; optional weekly routine (day, start, end, room).

Enroll/unenroll students; keep enrollment history.

3) Attendance

Daily attendance per batch (present/absent/late; reason).

Bulk mark + quick filters.

Reports: weekly & monthly attendance by batch and by student; export CSV/PDF.

4) Assessments, Results & Progress

Create Assessment (title, date, max score, batch).

Enter/edit scores; optional notes.

Reports:

Result sheet per assessment (with rank/percent).

Student progress report across assessments (sparkline/summary).

Final result report per batch/term; export CSV/PDF.

“Release” toggle (what guardians can see).

5) Fees, Invoices & Collections (manual only)

Define fee items (tuition, exam fee, admission fee, discounts).

Create invoices per student/guardian in BDT (due date, items, total).

Record manual payments (cash/bKash ref typed in; no gateway), partials supported.

Generate Receipt (printable/email).

Reports:

Fee collection report (date range, batch filter).

Outstanding dues by guardian/student.

6) Promotions / Transfers

End of term: Promote students from Batch A → Batch B (keep history).

Mid-term Transfer between batches; carry fees/attendance history.

Audit record of every promotion/transfer.

7) Staff/Teacher Management (basic)

Add staff/tutors; roles & permissions.

Assign responsibilities/routines/classes.

(Defer payroll/HR/auto attendance.)

8) Lead / Inquiry Management (no messaging)

Public Inquiry form (offline/online).

List of inquiries/leads; status (new, contacted, enrolled, dropped).

Notes & attachments. (Defer call/SMS history.)

9) Question Bank / Materials (phaseable)

Phase 1: upload/share PDFs by batch (materials manager).

Phase 2 (later): OMR, question bank, one-click paper generation.

10) Reports (menu)

Students: weekly/monthly, attendance, fee collection, progress, results.

Finance (manual fees): daily/monthly income reports by category; export.

Admin: audit log export.

11) Guardians’ Portal (read-only MVP)

View student profile, attendance summary, assessments & released results, invoices & receipts (manual status).

12) Non-functional & Ops

i18n EN/BN; Unicode fonts for Bangla.

Timezone: Asia/Dhaka (BST), date/number formats in BDT.

Validation (Zod), rate limits, CSRF, strong password policy; Argon2 hashes.

Backups (daily), error tracking (Sentry), minimal analytics.

Deploy close to BD (e.g., Vercel bom1/sin1 + Supabase ap-south-1/ap-southeast-1).

13) Acceptance checks (quick)

Create student via admission → appears in batch list with reg no.

Mark attendance for a day → weekly/monthly report matches entries.

Create assessment → enter scores → result sheet exports CSV/PDF.

Create invoice → record partial cash → dues reflect correctly → print receipt.

Promote a batch → history shows old & new batch; attendance preserved.

Guardian login → sees only their child’s released results & invoices.
