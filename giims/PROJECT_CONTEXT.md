# GIIMS - PROJECT CONTEXT & MEMORY
**Target:** Govt. Technical Training Institute, Rahim Yar Khan
**Stack:** Laravel, Inertia.js, React, Tailwind CSS, PostgreSQL

## Architecture Rules
1. **Domain-Driven Design:** All heavy business logic lives in `app/Domains/`.
2. **RBAC First:** No hardcoded roles. Every route must be protected.
3. **Multi-Tenant Ready:** Designed for multiple institutes.
4. **API Ready:** Business logic must be separated from controllers.
5. **No Data Loss:** Use SoftDeletes for all transactional tables.

## Current Status
- [x] Phase 1 Setup: Project Foundation initialized.
- [x] Phase 1 Database: Migrations and Seeders completed.
- [x] Phase 2 Database: Organization & Academic Schema completed.
- [x] Phase 2 Data: Organization Seed Data completed.
- [x] Phase 2 UI: Organization Management View completed.
- [x] Phase 3 & 4 Database: Student Identity and Admissions Schema completed.
- [x] Phase 3 UI: Admission Campaigns Management completed.
- [x] Phase 3 UI: Public Landing Page and Course Catalog completed.
- [x] Phase 3 UI: Master Student Profile completion workflow established.
- [x] Phase 3 UI & Logic: Course Application Submission and Document Uploads completed.
- [x] Phase 4 UI & Logic: Admin Application Review and Document Verification completed.
- [x] Phase 4 UI & Logic: Merit Engine and Selection workflow completed.
- [x] Phase 5 UI: Admin Command Center Layout and Routing completed.
- [x] Phase 5 UI & Logic: Student Enrollment and Batch Allocation completed.
- [x] Phase 5 UI & Logic: Student Academic Dashboard completed.
- [x] Phase 6 Database: Academic LMS Schema and Teacher Mapping completed.
- [x] Phase 6 UI: Teacher Portal & Dashboard completed.
- [x] Phase 6 UI & Logic: Teacher Lesson Plans and Resource Uploads completed.
- [x] Phase 6 UI & Logic: Student LMS & Teacher Assignment Management completed.
- [x] Phase 7 Database & UI: Multi-layer Attendance schema and Gate Security Portal completed.
- [x] Phase 7 UI & Logic: Classroom Attendance and Leave Management completed.
- [x] Phase 8 & 9: Examinations & Result Locking Engine completed.
- [x] Phase 10 UI & Logic: Department Clearances and Certificate generation completed.
- [x] Phase 11 UI & Logic: Workshop Inventory & Store Management completed.
- [x] Phase 12 UI & Logic: Discipline & Incident Management completed.
- [x] Phase 13 UI & Logic: Alumni Placement and Job Tracking completed.
- [x] Phase 14 UI & Logic: Broadcast Announcements and Dashboard Analytics completed.
- [x] Phase 15 UI & Logic: Reporting Engine and TEVTA Data Exports completed. SYSTEM CORE FINISHED.
- [x] Phase 16 UI & Logic: Staff Management module completed.
- [x] Phase 17 UI & Logic: Academic Allocations and Batch-Teacher assignments completed.
- [x] Phase 18 CBT & Public Overhaul: Online CBT Exam Engine, CSV Question Bank Bulk Importer, Timed Student Examination Interface, Official Government of Pakistan/TEVTA UI Overhaul, and Complete System Audit completed.
- [x] Phase 19 Security Hardening & Patches: Route-level RoleMiddleware protection, Soft-Delete compatible composite unique indexes, CBT background exam auto-closure command, resilient CSV MIME validation, and hardware barcode/RFID scanner listener completed.
- [x] Phase 20 Enterprise Master Polish, Role Refinement, & Future-Proofing: Dynamic white-label SiteSettings with global Inertia sharing, comprehensive immutable ActivityLog audit trail with diff viewer, granular multi-role permission separation (Super Admin / Principal / Clerk / Teacher), fail-safe operational manual overrides (CBT force-submit & grade, admin attendance override, merit ranking manual reorder), React ErrorBoundary containment, print media queries (@media print) on certificates, merit lists, and gradebooks, and zero-regression test suite validation (43 passing tests, 158 assertions) completed.

