<!-- README.md excerpt: MVP Scope & Requirements -->

# Tutoring MVP — Scope & Requirements

> **Roles:** Owner/Admin, Staff/Tutor, Guardian (read-only to their child).  
> **Non-functional:** i18n (EN/BN), Asia/Dhaka timezone, BDT formats, Zod validation, rate limits, CSRF, Argon2 hashes, daily backups, Sentry, deploy near BD (Vercel `bom1`/`sin1`, Supabase `ap-south-1`/`ap-southeast-1`).

---

## ✅ Core Users & RBAC
- [ ] Role-based access on every page (Admin / Staff / Guardian).
- [ ] Audit log for sensitive actions (who/what/when/before-after).

---

## 1) Admissions & Student/Guardian Management
- [ ] Offline/online admission form (EN + BN).
- [ ] Auto **Registration No.** (custom prefix).
- [ ] Student fields: name, DOB, gender, photo, address, institute, batch choice, notes, intake date.
- [ ] Guardian(s): name, relation, phone, email (many-to-many student ↔ guardian).
- [ ] CRUD for students & guardians.
- [ ] Upload/manage student photo.
- [ ] Soft-delete + restore.

---

## 2) Batches / Classes / Routine
- [ ] Create **Batch** (name, subject, session, capacity, start/end).
- [ ] Assign **Tutor** to batch.
- [ ] Optional weekly routine (day, start, end, room).
- [ ] Enroll/unenroll students; keep enrollment history.

---

## 3) Attendance
- [ ] Daily attendance per batch (present / absent / late; reason).
- [ ] Bulk mark + quick filters.
- [ ] **Reports**: weekly & monthly by batch and by student.
- [ ] Export CSV/PDF.

---

## 4) Assessments, Results & Progress
- [ ] Create **Assessment** (title, date, max score, batch).
- [ ] Enter/edit scores; optional notes.
- [ ] Result sheet per assessment (rank/percent).
- [ ] Student progress report across assessments (sparkline/summary).
- [ ] Final result report per batch/term (CSV/PDF).
- [ ] “Release” toggle controls guardian visibility.

---

## 5) Fees, Invoices & Collections (manual only)
- [ ] Define fee items (tuition, exam, admission, discounts).
- [ ] Create invoices per student/guardian in **BDT** (due date, items, total).
- [ ] Record manual payments (cash / typed bKash ref); support partials.
- [ ] Generate printable/email **Receipt**.
- [ ] **Reports**: fee collection (date range, batch filter).
- [ ] Outstanding dues by guardian/student.

---

## 6) Promotions / Transfers
- [ ] End-of-term **Promote** Batch A → Batch B (keep history).
- [ ] Mid-term **Transfer** between batches (carry fees/attendance history).
- [ ] Audit record of every promotion/transfer.

---

## 7) Staff/Teacher Management (basic)
- [ ] Add staff/tutors; roles & permissions.
- [ ] Assign responsibilities / routines / classes.
- [ ] *(Payroll/HR/auto attendance deferred.)*

---

## 8) Lead / Inquiry Management (no messaging)
- [ ] Public **Inquiry form** (offline/online).
- [ ] Lead list with status: new / contacted / enrolled / dropped.
- [ ] Notes & attachments. *(Call/SMS history deferred.)*

---

## 9) Question Bank / Materials (phaseable)
- [ ] **Phase 1:** upload/share PDFs by batch (materials manager).
- [ ] **Phase 2 (later):** OMR, question bank, one-click paper generation.

---

## 10) Reports (menu)
- [ ] Students: weekly/monthly, attendance, fee collection, progress, results.
- [ ] Finance (manual fees): daily/monthly income by category (export).
- [ ] Admin: audit log export.

---

## 11) Guardians’ Portal (read-only MVP)
- [ ] View student profile.
- [ ] Attendance summary.
- [ ] Released assessments/results.
- [ ] Invoices & receipts (manual status).

---

## 12) Non-Functional & Ops
- [ ] i18n EN/BN; Unicode fonts for Bangla.
- [ ] Timezone: **Asia/Dhaka (BST)**; BDT currency/number formats.
- [ ] Validation (Zod), rate limits, CSRF, strong password policy; **Argon2** hashes.
- [ ] Backups (daily) + documented restore.
- [ ] Error tracking (Sentry); minimal privacy-respecting analytics.
- [ ] Deploy close to BD (Vercel `bom1`/`sin1` + Supabase `ap-south-1`/`ap-southeast-1`).

---

## ✅ Acceptance Checks (MVP)
- [ ] Create student via admission → appears in batch list with reg no.
- [ ] Mark attendance for a day → weekly/monthly report matches entries.
- [ ] Create assessment → enter scores → result sheet exports CSV/PDF.
- [ ] Create invoice → record **partial** cash → dues update → print receipt.
- [ ] Promote a batch → history shows old & new; attendance preserved.
- [ ] Guardian login → sees only their child’s **released** results & invoices.

---

### Status Legend
- ☐ Not started ▪ ◑ In progress ▪ ☑ Done
