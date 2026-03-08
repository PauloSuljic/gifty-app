# Copilot Review Instructions for Gifty

These instructions tailor automated PR review comments for this monorepo (`frontend/` + `backend/`).

## Source of truth

- Prefer repo docs over generic advice:
  - `AGENTS.md`
  - `docs/PROJECT_INSTRUCTIONS.md`
  - `docs/FOLDER_STRUCTURE.md`
  - `backend/README.md`
  - `frontend/README.md`
- If a suggestion conflicts with documented project conventions, follow project conventions.

## Review focus (global)

Do comment on:

- Correctness bugs and behavioral regressions.
- Broken loading/error states and user-visible flicker or confusing UX.
- Security issues, secrets, unsafe auth handling, and unsafe logging of sensitive data.
- Missing validation, missing edge-case handling, and missing tests for changed behavior.
- Changes that break CI expectations (`make check`: backend tests, frontend build, frontend lint).

Do not comment on:

- Pure formatting/import/style issues that tooling already enforces.
- Broad refactors unrelated to the PR scope.
- Architecture rewrites unless explicitly requested in the issue/PR.

## Frontend-specific (React + Vite + Tailwind)

Comment on:

- Route guards/auth flow correctness.
- Loading, empty, and error-state handling consistency.
- API request lifecycle correctness (stale UI, race conditions, missing failure states).
- Accessibility regressions (labels, keyboard/interaction basics, semantic controls).
- State updates that can cause stale rendering or inconsistent UI.

Avoid comments about:

- Replacing established component/layout patterns unless there is a real bug.
- Styling preferences when UX and readability are already acceptable.

## Backend-specific (ASP.NET Core 8 + MediatR + EF Core)

Comment on:

- CQRS boundary violations (transport logic in domain, business logic in controllers).
- Missing validation in application layer for new inputs.
- Error handling that bypasses middleware patterns without reason.
- Data consistency problems, unsafe null handling, and migration risks.
- Missing or weak tests around behavior changes.

Avoid comments about:

- Forcing abstractions or package changes without a concrete defect.
- Introducing cross-cutting refactors when a narrow feature fix is sufficient.

## Final review principle

- Keep comments actionable, specific, and scoped to the diff.
- Prefer one high-signal comment over many low-value style notes.
