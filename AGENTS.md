# AGENTS.md — Gifty quickstart for humans and AI

**Purpose:** Fast, low-friction guidance for working in this monorepo. Keep changes small, follow the commands below, and use `/docs` for deeper details.

---

## Repo layout (root)
- `frontend/` — React + Vite + Firebase + Tailwind.
- `backend/` — ASP.NET Core 8 API + EF Core + MediatR.
- `.github/` — GitHub Actions workflows.
- `docs/` — Source-of-truth context (see links below).

---

## Workflow & PR rules
- Trunk-based: always open PRs into `master` from short-lived branches (`feature/<topic>`).
- Keep PRs focused; avoid wide, unrelated changes.
- Update docs when structure or conventions change; prefer edits in `/docs` over repeating instructions elsewhere.
- Use meaningful commit messages and concise PR descriptions.

---

## Definition of done
- Run required checks until they are green (see `make check` below).
- Ensure no secrets or credentials are added.
- Avoid touching generated/build artifacts; commit only source + intentional docs.
- Prefer minimal, reversible diffs; avoid reformatting unrelated code.
- Confirm README/docs references stay accurate if you move files.

---

## Canonical commands (prefer `make`)
- `make check` — runs backend tests + frontend build + frontend lint.
- `make backend-test` — `cd backend && dotnet test` (restores/builds as needed).
- `make frontend-build` — `cd frontend && npm run build`.
- `make frontend-lint` — `cd frontend && npm run lint`.
- Helpers: `make backend-restore` (`cd backend && dotnet restore`), `make frontend-install` (`cd frontend && npm ci`).
- If `make` is unavailable, run the underlying commands shown above. Install frontend deps with `npm ci` before build/lint.

---

## Getting started
1. Read the docs listed below (they define conventions and current context).
2. Ensure you have .NET 8 SDK, Node 18+, and PostgreSQL if running the API locally.
3. Install deps where needed (`make backend-restore`, `make frontend-install`).
4. Run `make check` before opening a PR; fix issues or note blockers.
5. Keep changes localized; update the relevant README or doc if behavior changes.

---

## Backend quick reference
- Run API locally: `cd backend && dotnet ef database update && dotnet run`.
- Tests: `make backend-test` (or `dotnet test`).
- Logging: Serilog with correlation IDs (see middleware in API).
- Architecture: CQRS with MediatR; follow existing command/query + validator patterns.

---

## Frontend quick reference
- Dev server: `cd frontend && npm run dev`.
- Build: `make frontend-build`; Lint: `make frontend-lint`.
- Keep styling Tailwind-first; components are feature-scoped under `src/features` or `src/components`.
- Environment: use `.env` or `.env.local`; do not commit env files with secrets.

---

## Safety rules
- Never commit secrets or credentials; use local user-secrets or env vars.
- Do not edit generated files (`bin/`, `obj/`, `node_modules/`, build outputs).
- Keep changes scoped and reversible; prefer incremental commits.
- Align with existing patterns; check `/docs` before introducing new ones.
- If touching migrations or infra, note any manual steps in the PR description.

---

## Where to read next (single-purpose docs)
- `docs/PROJECT_INSTRUCTIONS.md` — Working agreements, architecture conventions, and repo norms.
- `docs/CHAT_CONTEXT.md` — Current-state snapshot (milestones, tasks, recent PRs).
- `docs/FOLDER_STRUCTURE.md` — High-level map of backend/frontend folders.
- `backend/README.md` — Backend setup, commands, and deployment notes.
- `frontend/README.md` — Frontend setup and environment variables.

---

## Quick checklist for AI agents
- Start by skimming the docs above; avoid duplicating their content.
- Use the Makefile targets for tests/builds; keep output in PRs brief and actionable.
- When in doubt about scope or patterns, prefer existing conventions in `/docs` over inventing new ones.
- Keep commits small and PR summaries focused on what changed and how to validate (`make check`).
