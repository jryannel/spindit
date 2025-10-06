# Product Requirements Document (PRD)

## Project: School Locker Management (SaaS)

**Version:** 1.0\
**Date:** 2025-10-06\
**Owner:** Codex Coding Agent

------------------------------------------------------------------------

### 1. Goal

The application enables the **management of school lockers** for around
1,000 units.\
Parents register, request lockers for their children, and receive an
assigned locker once payment is confirmed.\
Janitors and staff manage locker status and invoices.\
The system should support paperless processes with automated emails, PDF
invoices, and clear deadlines.

------------------------------------------------------------------------

### 2. Technical Stack

  Component            Technology
  -------------------- --------------------------------------------------------
  **Backend**          PocketBase v0.30
  **Frontend**         Vite + React + TypeScript
  **UI Framework**     Mantine UI
  **Icons**            Tabler Icons React
  **SDK**              PocketBase JS SDK
  **PDF Generation**   Go Extension in PocketBase (gofpdf)
  **Cron Jobs**        Native PocketBase Cron Engine (v0.30)
  **Database**         SQLite
  **Auth**             PocketBase Auth Collection (`parents`) with Basic Auth
  **Localization**     German + English via JSON i18n files

------------------------------------------------------------------------

### 3. Core Features

#### 3.1 Parent Portal

-   Parents register (name, address, language, email).
-   Parents request lockers by providing student name and class inline (no persistent child profile stored).
    -   Select school year (e.g., 2025/26)
    -   Choose zone preference
    -   Optionally enter desired locker number
-   After submission:
    -   System automatically reserves a locker if available.
    -   Generates an invoice (PDF).
    -   Sends an email with payment information.
-   After payment is marked by staff:
    -   Locker is permanently assigned.
    -   Parent receives final locker number via email.
-   Renewal notifications are sent each spring.
-   Dashboard: active lockers, invoices, request status, and remaining
    time.

#### 3.2 Backoffice (Staff)

-   Overview of all requests, reservations, and invoices.
-   Mark invoices as paid.
-   Automatic assignment and parent notification.
-   Manage locker zones (A/B/C/D) with description and uploaded map.
-   Configure school year, deadlines, and pricing.
-   Manually release or reassign lockers if needed.

#### 3.3 Janitor

-   Locker occupancy plan (tabular + optional PDF export).
-   View by zone with locker status (free/reserved/occupied).
-   Read-only access.

------------------------------------------------------------------------

### 4. Workflows

#### 4.1 Locker Request

1.  Parent logs in → enters student name/class & school year → selects zone.
2.  System reserves a free locker.
3.  Generates PDF invoice.
4.  Sends email with invoice and payment deadline (e.g., 7 days).
5.  Cronjob checks expiration:
    -   After deadline → reservation expires, locker freed.
    -   Reminder emails sent at day -3 and 0.

#### 4.2 Payment & Assignment

-   Staff marks invoice as **paid**.
-   System creates an **assignment** record.
-   Locker marked as **occupied**.
-   Parent receives final locker number email.

#### 4.3 Renewal

-   In spring (e.g., March), cronjob opens renewal window.
-   Parents with active lockers get email to renew.
-   Renewal creates a new invoice for the next year.
-   After renewal deadline → lockers are released automatically.

------------------------------------------------------------------------

### 5. Data Model (PocketBase Collections)

  ------------------------------------------------------------------------
  Collection                 Purpose              Key Fields
  -------------------------- -------------------- ------------------------
  **zones**                  School zones /       name, description,
                             locations            class_tags, map_image

  **lockers**                Locker details       id, zone, status, note

  **parents** *(auth)*       Parent accounts      name, address, phone,
                                                  language

  **requests**               Locker requests      parent, student_name,
                                                  student_class,
                                                  school_year,
                                                  preferred_zone,
                                                  preferred_locker, status

  **reservations**           Temporary            request, locker,
                             reservations         expires_at

  **invoices**               Payment records      request, number,
                                                  amount_cents, currency,
                                                  status, pdf, paid_at

  **assignments**            Final assignments    child, locker,
                                                  school_year, start_date,
                                                  end_date

  **settings**               System configuration key, value (JSON)

  **audit_logs**             Change tracking      actor_id, action,
                                                  entity, meta, created_at
  ------------------------------------------------------------------------

------------------------------------------------------------------------

### 6. Status Model

**Lockers:**\
`free` → `reserved` → `occupied`

**Invoices:**\
`open` → `paid` → `expired`

**Requests:**\
`open` → `reserved` → `completed` or `rejected`

------------------------------------------------------------------------

### 7. Cron Jobs

  ---------------------------------------------------------------------------------
  Job                     Schedule                   Description
  ----------------------- -------------------------- ------------------------------
  `reservations.expire`   `*/1 * * * *`              Frees expired reservations.

  `invoices.reminders`    `0 8 * * *`                Sends payment reminders (T-3,
                                                     T-0).

  `renewals.open`         `0 9 * * *`                Opens renewal window in
                                                     spring.

  `assignments.close`     `0 9 1 8 *`                Frees unrenewed lockers at end
                                                     of school year.
  ---------------------------------------------------------------------------------

------------------------------------------------------------------------

### 8. PDF Invoices

-   Generated via **Go extension** in PocketBase.
-   Template includes logo, school year, amount, IBAN, and reference
    number.
-   Language based on `parent.language`.
-   PDF stored in `invoices.pdf`.
-   Filename: `invoice_<number>.pdf`.

------------------------------------------------------------------------

### 9. Frontend (Vite + Mantine)

#### Structure

    src/
      app/
        routes/
          login.tsx
          dashboard/
            index.tsx
            requests.tsx
            invoices.tsx
            renewals.tsx
          staff/
            index.tsx
            invoices.tsx
            lockers.tsx
            zones.tsx
          janitor/
            occupancy.tsx
      components/
      features/
      lib/
      styles/

#### UI Components

-   Login/Register
-   Dashboard (tabs: requests, invoices, lockers)
-   Request Wizard
-   InvoiceCard (download invoice, show status)
-   LockerTable (for janitor)
-   ZoneBadge / StatusPill (colored indicators)

#### Design

-   Mantine theme with school colors (configurable)
-   Responsive layout
-   Optional dark mode

------------------------------------------------------------------------

### 10. Localization (DE/EN)

-   JSON files `/locales/de.json` and `/locales/en.json`
-   Language based on `parent.language`
-   Emails and PDFs are bilingual

------------------------------------------------------------------------

### 11. Security & Privacy

-   Role-based access (PocketBase Access Rules)
-   Parents can only see their data
-   Janitor: read-only
-   Staff/Admin: full access
-   GDPR compliant (minimal child data)
-   Audit logs for critical changes

------------------------------------------------------------------------

### 12. Configuration

-   School year (start/end)
-   Reservation duration (days)
-   Renewal window (start/end)
-   Price per year
-   Email sender address
-   Timezone (`Europe/Berlin`)

------------------------------------------------------------------------

### 13. MVP Goals

1.  Parent registration and locker requests.\
2.  Automatic reservation and invoice generation.\
3.  Staff payment confirmation.\
4.  Automatic assignment after payment.\
5.  Cron jobs for expiration and reminders.\
6.  Janitor view of locker occupancy.\
7.  Fully automated email and PDF handling.

------------------------------------------------------------------------

### 14. Future Enhancements

-   Online payments (e.g., Stripe)
-   Multi-school (multi-tenant) support
-   Mobile optimized interface
-   QR codes for locker check-in
-   Statistics and exports

------------------------------------------------------------------------

### 15. Definition of Done

-   CRUD fully functional via PocketBase Admin.\
-   Hooks & cron jobs stable and idempotent.\
-   Parent flow works end-to-end (request → payment → assignment).\
-   Emails & PDFs in both languages.\
-   Access control verified for all roles.\
-   No logic or status transition bugs.
