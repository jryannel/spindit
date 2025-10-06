# Repository Guidelines

## Project Structure & Module Organization
- `main.go` hosts the PocketBase v0.30 entrypoint; Go migrations live in `migrations/` and register themselves via package import.
- Backend extensions sit under `internal/` (`app/cronjobs` for cron stubs, `pbext/pdf` for Go extensions). The React frontend lives in `frontend/`.
- Student details (name/class) are captured inline on `requests`; there is no separate `children` collection to align with GDPR constraints.
- Supporting docs include `implementation_plan.md` for milestone tracking and `README.md` for local setup.

## Build, Test, and Development Commands
- `task build` (or `go build -o pb-server .`) compiles the PocketBase server.
- `task serve` runs `go run . serve --dev --migrationsDir ./migrations` for local development with Go migrations applied.
- `task test` delegates to `go test ./...` across all Go packages.
- `task tidy` formats and tidies the module (`go fmt ./...` + `go mod tidy`).

## Coding Style & Naming Conventions
- Go sources follow `gofmt`; run `task tidy` before committing.
- Name Go packages lowercase without underscores; exported identifiers use PascalCase, private helpers camelCase.
- Placeholder frontend (when added) should follow React TypeScript conventions with PascalCase components and kebab-case route files.

## Testing Guidelines
- Use Go’s standard `testing` package; place tests alongside sources as `_test.go` files.
- Name tests `Test<Function>` and include table-driven cases when coverage is critical.
- Run `task test` before submitting PRs; add regression tests for bugs.

## Commit & Pull Request Guidelines
- Match existing commit style: `<type>: <concise summary>` (e.g., `feat: bootstrap pocketbase backend foundation`).
- Keep commits scoped; document major changes in `implementation_plan.md` checkboxes when delivering milestone items.
- PRs should summarize intent, note testing performed (`go test ./...`), and link relevant issues or milestone tasks. Include screenshots or logs if UI/cron behavior is affected.

## Security & Configuration Tips
- Store PocketBase data under `pb_data/`; never commit secrets or SMTP credentials.
- For Coolify deploys, run `pb-server serve --http="0.0.0.0:8090" --migrationsDir ./migrations` and mount persistent storage for `pb_data/`.
