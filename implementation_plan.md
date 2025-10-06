# Locker Management Implementation Plan

## Overview
This plan breaks the School Locker Management SaaS into three sequential milestones. Each milestone delivers a testable slice that builds toward the MVP goals defined on October 6, 2025. Every milestone lists primary objectives, key workstreams, acceptance criteria, and dependencies.

---

## Milestone 1 – PocketBase Foundations & Data Model
**Goal:** Stand up the PocketBase backend with core collections, access rules, and automation scaffolding so that CRUD flows exist for staff via the admin UI.

**Target Duration:** 2 weeks

**Workstreams**
- PocketBase project bootstrap (v0.30) with environment configuration, auth collection (`parents`), and locale settings.
- Define collections (`zones`, `lockers`, `parents`, `children`, `requests`, `reservations`, `invoices`, `assignments`, `renewals`, `email_queue`, `audit_logs`) including schema, relations, and validation rules from the PRD.
- Implement access rules for parents, staff, and janitor roles matching privacy requirements.
- Create admin UI views and seed data scripts for locker zones and sample lockers.
- Scaffold cron job placeholders (`reservations.expire`, `invoices.reminders`, `renewals.open`, `assignments.close`) and register Go extension for PDF generation (no template yet).

**Acceptance Criteria**
- Collections created with required fields, indexes, and relation integrity enforced.
- Role-based access rules verified via PocketBase admin simulations.
- Seed script populates sample zones A–D and 1,000 lockers with status flags.
- Cron job definitions exist and log executions without side effects.
- Repository contains PocketBase config, migration scripts, and README setup notes.

**Dependencies & Notes**
- Requires final confirmation of school year configuration defaults.
- Coordinate with infrastructure for hosting PocketBase (Docker compose or binary deployment).
