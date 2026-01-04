# CHAT CONTEXT — Gifty (short snapshot)
Last updated: 2025-09-25
Author: Paulo Suljic

**Purpose:** Current-state snapshot for the active sprint. For commands, definition of done, and workflow rules, see `AGENTS.md`.

**Docs pointers:** `AGENTS.md` (quickstart + checks) · `docs/PROJECT_INSTRUCTIONS.md` (working agreements) · `docs/FOLDER_STRUCTURE.md` (repo map)

## Quick summary
- Repo: monorepo with **frontend** (React + Vite + Firebase + Tailwind) and **backend** (ASP.NET Core 8 + PostgreSQL + EF Core; Redis optional).
- Current milestone: **Web MVP — Strong foundation** (friendships + birthdays upcoming).
- Backend refactor: ✅ CQRS/MediatR, FluentValidation pipeline, centralized exception middleware, domain events + handlers, Serilog with correlation IDs.
- Tests: ✅ All unit + integration tests green (xUnit).
- CI/CD: GitHub Actions for backend + frontend; PRs merge to `master`; merges to `master` auto-deploy to production (no staging branch today; dev env may come later).
- Known failing items: none (last run green).

## Recent commits / important PRs
- `master`: fixed tests + login flow (`b126a49`).
- PR #25: Backend refactor & validators (merged to `master`).

## Open high-priority tasks
1. **Frontend UX polish** — My Wishlists redesign, Shared With Me grouping/detail, add item images.
2. **Backend additions** — PictureUrl for WishlistItem, friendship endpoints scaffold, birthdays + calendar endpoint.
3. **Housekeeping** — Keep `/docs` files updated after each feature (including this snapshot).

## Local dev quick commands (current snapshot)
### Backend
```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```
- API: https://localhost:5140
- Swagger: https://localhost:5140/swagger

### Frontend
```bash
cd frontend
npm install
npm run dev
```
- App: http://localhost:5173

> Validation commands (tests/build/lint) live in `AGENTS.md` and the root `Makefile` (`make check`).
