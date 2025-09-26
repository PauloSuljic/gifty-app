# CHAT CONTEXT — Gifty (short snapshot)
Last updated: 2025-09-25
Author: Paulo Suljic

## Quick summary
- Repo: mono repo with frontend (React+Vite) + backend (ASP.NET Core 8 + Postgres)
- Current sprint / milestone: Web MVP (friendships + birthdays upcoming)
- Backend refactor: Completed (CQRS via MediatR, FluentValidation pipeline, Serilog, domain events skeleton)
- Tests: Backend unit + integration tests passing locally (xUnit)
- Known failing items: none (all green as of last run)
- CI: GitHub Actions for backend+frontend -> staging & master workflows exist

## Recent commits / important PRs
- staging: merged master, resolved tests + login fixes (commit b126a49)
- PR: backend refactor & validators (merged to staging) — see PR #25 (local note)

## Open high-priority tasks
1. Frontend: UI/UX audit for “My wishlists” page (mobile-first).  
2. Backend: Add domain event handlers for Wishlist/WishlistItem (complete for Users) — done/partial.
3. Add image scraping + wishlist item picture field (backend + frontend).
4. Friendship API (request/accept) + seeds for integration tests.

## Local dev quick commands
- Backend: `cd backend && dotnet restore && dotnet ef database update && dotnet run`
- Frontend: `cd frontend && npm install && npm run dev`

## Files to read in /docs (ordered)
1. CHAT_CONTEXT.md (this file)
2. BACKEND_README.md
3. FOLDER_STRUCTURE.md
4. PROJECT_INSTRUCTIONS.md

## Contact/owner
- Paulo Suljic — github: PauloSuljic — project site: https://giftyapp.live
# CHAT CONTEXT — Gifty (short snapshot)
Last updated: 2025-09-25  
Author: Paulo Suljic

## Quick summary
- Repo: monorepo with **frontend** (React + Vite + Firebase + Tailwind) and **backend** (ASP.NET Core 8 + PostgreSQL + EF Core; Redis optional).
- Current milestone: **Web MVP – Strong foundation**.
- Backend refactor: ✅ **Done** — CQRS/MediatR (commands & queries), FluentValidation pipeline, centralized exception middleware, **domain events + handlers** (Users, Wishlists, WishlistItems, SharedLinks), and Serilog with **Correlation-Id** enrichment.
- Tests: ✅ All **unit + integration** tests green (xUnit).
- CI/CD: GitHub Actions for **staging** and **production** (backend + frontend) deploying to Azure.

## Recent commits / important PRs
- `staging`: merged `master`, fixed tests + login flow (`b126a49`).
- PR #25: Backend refactor & validators (merged to `staging`).

## Open high‑priority tasks
1. **Frontend UX polish**  
   - Redesign *My Wishlists* (grid cards + hierarchy).  
   - Improve *Shared With Me* (group by owner + detail page).  
   - Add item images (manual upload now; optional scraping later).
2. **Small backend additions**  
   - Add `PictureUrl` to `WishlistItem` (+ validation + migration + API).  
   - Friendship endpoints (request/accept/block) — scaffold only for MVP.  
   - Birthdays + simple calendar endpoint (read-only list) — next.
3. **Housekeeping**  
   - Keep `/docs` files updated after each feature (this file, READMEs, folder structure).

## Local dev quick commands
### Backend
```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

- API: `https://localhost:5140`  
- Swagger: `https://localhost:5140/swagger`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

- App: `http://localhost:5173`

## Files to read in `/docs` (order)
1. `CHAT_CONTEXT.md` (this file)
2. `MONOREPO_README.md`
3. `BACKEND_README.md`
4. `FRONTEND_README.md`
5. `FOLDER_STRUCTURE.md`
6. `PROJECT_INSTRUCTIONS.md`

## Owner
Paulo Suljic — GitHub: https://github.com/PauloSuljic — Live: https://giftyapp.live