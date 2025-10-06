# Locker Management Implementation Plan

## Overview
This plan breaks the School Locker Management SaaS into three sequential milestones. Each milestone delivers a testable slice that builds toward the MVP goals defined on October 6, 2025. Every milestone lists primary objectives, key workstreams, acceptance criteria, and dependencies.

| Milestone | Status | Target Duration | Notes |
|-----------|--------|-----------------|-------|
| Milestone 1 – PocketBase Foundations | ✅ Completed | 2 weeks | Backend scaffolding merged October 2025 |
| Milestone 2 – Parent & Staff Workflows | 🚧 In Progress | 4 weeks | React shell + auth scaffolding committed |
| Milestone 3 – Operations & Launch | 🔜 Not Started | 3 weeks | Schedule post-M2 stabilization |

---

## Milestone 1 – PocketBase Foundations & Data Model
**Goal:** Stand up the PocketBase backend with core collections, access rules, and automation scaffolding so that CRUD flows exist for staff via the admin UI.

**Target Duration:** 2 weeks

**Workstreams**
- [x] PocketBase project bootstrap (v0.30) with environment configuration, auth collection (`parents`), and locale settings.
- [x] Define collections (`zones`, `lockers`, `parents`, `children`, `requests`, `reservations`, `invoices`, `assignments`, `renewals`, `email_queue`, `audit_logs`) including schema, relations, and validation rules from the PRD.
- [x] Implement access rules for parents, staff, and janitor roles matching privacy requirements.
- [x] Create admin UI views and seed data scripts for locker zones and sample lockers.
- [x] Scaffold cron job placeholders (`reservations.expire`, `invoices.reminders`, `renewals.open`, `assignments.close`) and register PDF Go extension compiled for PocketBase Go extension API v0.30 (no template yet).

**Acceptance Criteria**
- [x] Collections created with required fields, indexes, and relation integrity enforced.
- [x] Role-based access rules verified via PocketBase admin simulations.
- [x] Seed script populates sample zones A–D and 1,000 lockers with status flags.
- [x] Cron job definitions exist and log executions without side effects.
- [x] Repository contains PocketBase config, migration scripts, and README setup notes.

**Dependencies & Notes**
- Requires final confirmation of school year configuration defaults.
- Coordinate with infrastructure for hosting PocketBase (Docker compose or binary deployment).
- Deploy PocketBase via Coolify with minimal Docker configuration to streamline hosting.

## Milestone 2 – Parent & Staff Workflows
**Goal:** Deliver end-to-end locker request, reservation, invoicing, and payment confirmation flows across the React frontend and PocketBase hooks.

**Target Duration:** 4 weeks

**Workstreams**
- [x] Build Vite + React app shell with Mantine theme, routing, and authentication integration using PocketBase JS SDK.
- [x] Implement parent portal core features: authentication, child management, locker request wizard, and request dashboard.
- [ ] Add localization (DE/EN) and transactional email templates for parent flows.
- [ ] Develop server-side hooks for automatic reservation, invoice generation (integrating Go PDF template), and email dispatch queue.
- [ ] Create staff backoffice views for requests, invoices, zones, and manual overrides; include filters, status transitions, and payment confirmation UI.
- [ ] Wire cron jobs to execute business rules (reservation expiry, reminders) with logging and retry safeguards.

**Acceptance Criteria**
- [ ] Parent can request a locker, receive generated invoice PDF, and view status updates without admin intervention.
- [ ] Staff can mark invoices as paid, triggering locker assignment emails and locker status changes.
- [ ] Localization toggle confirmed for UI, emails, and PDFs.
- [ ] Automated emails stored in `email_queue` with delivery status; failures retried up to configured limit.
- [ ] End-to-end integration tested via scripted scenarios covering request → payment → assignment and expiration edge cases.

**Dependencies & Notes**
- Requires milestone 1 collections, access rules, and cron scaffolding.
- Coordinate with design for Mantine theming and responsive layouts.
- Confirm email delivery infrastructure (SMTP credentials, sender domain) before go-live testing.

## Milestone 3 – Operations, Quality, and Launch Readiness
**Goal:** Harden the platform with monitoring, janitor tooling, compliance reviews, and launch operations, culminating in a pilot-ready release.

**Target Duration:** 3 weeks

**Workstreams**
- [ ] Implement janitor occupancy views (tabular + PDF export) with role-locked access and caching for large locker sets.
- [ ] Add audit logging, GDPR data retention routines, and backup automation for PocketBase (SQLite snapshots, file assets).
- [ ] Build monitoring dashboards (cron execution metrics, email success rates) and integrate alerting for failures.
- [ ] Conduct localization QA, accessibility checks, and performance profiling for high-volume requests.
- [ ] Run pilot onboarding: migrate legacy locker assignments, train staff/janitors, execute cutover runbook, and document support SOPs.

**Acceptance Criteria**
- [ ] Janitor portal delivers accurate occupancy visuals and exports without exposing parent PII.
- [ ] Automated backups scheduled and tested for restore scenarios (including invoices PDFs).
- [ ] Monitoring alerts raised on simulated cron failure and email bounce spikes.
- [ ] QA sign-off covering localization, accessibility (WCAG AA), and load test (1k concurrent parents request flow).
- [ ] Pilot checklist completed with sign-off from operations and school administration.

**Dependencies & Notes**
- Builds on fully functional workflows from Milestone 2.
- Requires coordination with IT for backup storage and monitoring endpoints.
- Schedule pilot during low-usage period before next school year cycle.
