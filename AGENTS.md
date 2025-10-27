# Repository Guidelines

## Project Structure & Module Organization
- Backend Go services live at the root (`main.go`, `cmd/`, `internal/`, `migrations/`). Keep business logic inside `internal/` and CLI entrypoints under `cmd/`.
- The single-page app resides in `frontend/`. Feature bundles live in `frontend/src/features/<domain>/`, application scaffolding in `frontend/src/app/`, and shared UI such as `PageTitle` in `frontend/src/app/components/`.
- Generated artifacts (`frontend/dist/`, `pb_data/`) stay out of Git; primary docs live beside this guide (`README.md`, `implementation_plan.md`).

## Build, Test, and Development Commands
- `task serve` — start PocketBase with Go migrations applied.
- `task migrate` — apply database migrations without serving.
- `task test` — run backend unit tests (`go test ./...`).
- `task tidy` — format Go sources and tidy module files.
- From `frontend/`: `npm run dev` spins up Vite, `npm run build` creates production bundles, and `npm run lint` runs ESLint against the Mantine + React codebase.

## Coding Style & Naming Conventions
- Go code is formatted with `gofmt`; package names stay lowercase (e.g., `internal/app/hooks`).
- TypeScript/React follows single quotes in TSX, PascalCase components, camelCase hooks/utilities, and colocated styles. Use Mantine v8 components and `mantine-datatable` for tabular layouts.
- Shared UX patterns (drawers, headers) belong in reusable components under `frontend/src/app/components/`.

## Testing Guidelines
- Backend tests live alongside implementation files (`*_test.go`) and should favour table-driven cases when branching heavily.
- Frontend tests are not yet scaffolded; when adding them, use Vitest colocated with the feature (`frontend/src/features/<domain>/**`) and document new scripts in `package.json`.
- Before submitting a PR touching Go code run `task test`; for UI or build tooling updates run `npm run build` and `npm run lint`.

## Commit & Pull Request Guidelines
- Commits follow conventional style `type(scope): summary` (e.g., `feat(frontend): adopt mantine datatable`). Squash work-in-progress commits locally.
- Pull requests should explain intent, list verification steps (e.g., ``task test``, ``npm run build``), call out schema or data migrations, and attach screenshots for visible UI changes. Reference related issues when available.

## Security & Configuration Tips
- Do not commit secrets, `.env` files, or `pb_data/`. Provide sample configuration via `.env.example` when needed.
- Treat student and guardian data as transient: avoid introducing persistent personal fields and scrub fixtures prior to sharing.
