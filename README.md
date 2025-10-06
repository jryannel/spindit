# Spindit Locker Management Backend

PocketBase v0.30 backend scaffolding for the School Locker Management SaaS. This repository currently covers Milestone 1 (backend foundations) from the PRD dated October 6 2025.

## Prerequisites

- Go 1.25+
- PocketBase CLI (optional for local admin UI)
- Node.js (optional, for future React frontend work)

## Local Development

1. Install dependencies and verify the build:
   ```bash
   go mod tidy
   go build ./...
   ```
   Or use the Taskfile shortcut:
   ```bash
   task build
   ```
2. Apply migrations and seed data using the Go migration pack:
   ```bash
   go run . serve --dev --migrationsDir ./migrations
   ```
   Or run the wrapper task:
   ```bash
   task serve
   ```
   The server boots with:
   - Core collections defined in Go migration `migrations/1728216000_init_collections.go`
   - Seed zones (A–D) and 1,000 lockers from `migrations/1728219600_seed_zones_lockers.go`
   - Stub cron jobs registered in `internal/app/cronjobs`
   - Placeholder PDF Go extension registered from `internal/pbext/pdf`
3. Access the PocketBase admin UI at `http://127.0.0.1:8090/_/` and create a staff superuser.
4. Launch the React frontend (in a separate terminal):
   ```bash
   task frontend:dev
   ```
   The app is served on `http://127.0.0.1:5173` and proxies requests directly to the PocketBase instance defined by `VITE_PB_URL` (defaults to `http://127.0.0.1:8090`).

## Coolify Deployment (Minimal Docker)

1. Build the PocketBase binary:
   ```bash
   go build -o pb-server .
   ```
2. Use the provided `Dockerfile` (to be added in Milestone 2) or supply Coolify with:
   - Executable command: `./pb-server serve --http="0.0.0.0:8090" --migrationsDir ./migrations`
   - Persistent volume mapped to `/app/pb_data`
   - Environment variables for SMTP and localization (`PB_SMTP_HOST`, `PB_DEFAULT_LANGUAGE`, etc.).
3. Configure Coolify health checks on `/` and map port `8090`.
4. Ensure the compiled Go migrations are included in the deployment image (they are bundled in the binary). Optional JS hooks can still be placed under `pb_hooks`.

## Repository Structure

- `main.go`: Go entrypoint with PocketBase CLI configuration
- `internal/app/cronjobs`: Cron placeholder registrations for reservations, invoices, renewals, assignments
- `internal/pbext/pdf`: Go extension stub targeting PocketBase Go extension API v0.30
- `migrations`: Go migrations defining collections and seed data
- `frontend/`: Vite + React + Mantine application shell (Milestone 2)
- `pb_hooks`: Reserved for future PocketBase hooks (empty during Milestone 1)

## Functional Notes

- Locker requests collect student name and class as part of each submission; no separate child profiles are stored to remain GDPR-compliant.

## Next Steps

- Flesh out Go PDF extension and email queue processing (Milestone 2)
- Add Coolify-ready Dockerfile and deployment pipeline
- Implement React/Mantine frontend and staff workflows
