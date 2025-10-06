# Repository Guidelines

## Project Structure & Module Organization
- `main.go` launches the PocketBase v0.30 backend; migrations live in `migrations/` and are applied with `go run . migrate`.
- Backend extensions reside under `internal/` (`app/cronjobs` for cron stubs, `pbext/pdf` for future PDF hooks).
- The Vite + React + Mantine SPA sits in `frontend/`; compiled assets land in `frontend/dist/` (ignored by Git).
- `implementation_plan.md` tracks milestone checklists. `pocketbase-llms.txt` documents the PocketBase API for quick reference.

## Build, Test, and Development Commands
- `task build` → `go build -o pb-server .` (backend binary).
- `task serve` → runs PocketBase in dev mode with Go migrations.
- `task frontend:dev` → starts the React dev server (`http://127.0.0.1:5173`).
- `task frontend:build` → production React build (`npm run build`).
- `task test` → `go test ./...` for backend packages. Use `npm run build` or `npm run test` for frontend checks when added.
- `task tidy` → `go fmt ./...` + `go mod tidy` (run before commits touching Go code).

## Coding Style & Naming Conventions
- Go code must pass `gofmt`; keep packages lowercase (`internal/app/cronjobs`).
- React components use PascalCase files under `frontend/src/app/…`; hooks live in `frontend/src/features/*/hooks`.
- Environment variables follow `VITE_*` for frontend (e.g., `VITE_PB_URL`).

## Testing Guidelines
- Use Go’s built-in `testing` package; name tests `TestFunctionName` and colocate in `_test.go` files.
- Frontend tests are not yet scaffolded—add Vitest with `npm run test` when UI logic stabilises.
- Run `task test` (and `npm run build` to catch TS errors) before proposing changes.

## Commit & Pull Request Guidelines
- Follow `<type>: <summary>` style (`feat(frontend): add parent portal`). Types in use: `feat`, `fix`, `docs`, `chore`, `refactor`.
- Keep commits focused; update `implementation_plan.md` checkboxes when closing a milestone task.
- PRs should summarise intent, list verification steps (`go run . migrate`, `npm run build`), and mention any schema changes.

## Security & Configuration Tips
- No child profiles are stored; locker requests capture student name/class inline for GDPR compliance.
- Do not commit secrets; PocketBase data lives under `pb_data/` (ignored locally). Configure SMTP credentials via environment variables in deployment.
