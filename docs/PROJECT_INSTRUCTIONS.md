# 📖 Gifty Project Instructions

This file defines **how we work on Gifty**.  
It is meant for both developers and AI assistants (ChatGPT) so that context is never lost.

---

## 📚 Documentation index
- `AGENTS.md` — Quickstart, commands, and definition of done (run `make check`).
- `docs/CHAT_CONTEXT.md` — Current-state snapshot (milestones, tasks, recent PRs).
- `docs/FOLDER_STRUCTURE.md` — High-level repo map.
- `docs/PROJECT_INSTRUCTIONS.md` — Working agreements + architecture conventions (you’re here).

---

## 🗂 Repo Layout
gifty-app/
├── frontend/     # Vite + React + Firebase + Tailwind
├── backend/      # ASP.NET Core 8 + PostgreSQL + CQRS + Redis (future)
├── .github/      # CI/CD workflows
├── PROJECT_INSTRUCTIONS.md   # You’re here
└── FOLDER_STRUCTURE.md       # Keep updated repo tree here

---

## 🎯 Goals & Milestones

### Milestone 1 — “Strong foundation” (Web MVP launch)
- Backend refactor with CQRS, domain events, validation, logging.
- Core flows: wishlists, items, shared links, auth.
- Basic UX polish: mobile-first, smooth sharing, product images.
- Tracking + minimal growth hooks.

### Milestone 2 — “Mobile goes live”
- React Native app with push notifications + contact sync.
- Real-time updates with SignalR.

### Milestone 3 — “Grow & monetize”
- Freemium tier, affiliate links, analytics, marketing tools.

---

## 🔧 Development Guidelines

### Branching
- `master` → trunk (production)
- Feature branches → `feature/<short-description>`

Always PR into **master**. Use feature branches for all work; keep master releasable.

---

### Backend Conventions
- CQRS with MediatR:  
  - `Commands` + `Handlers`  
  - `Queries` + `Handlers`  
- Validators: `Application/Features/<Entity>/Validators/`
- Exceptions: handled via global `ExceptionHandlingMiddleware`.
- Domain Events: raised inside entities, handled in `Application/Features/<Entity>/EventHandlers/`.
- Logging: Serilog in API layer, `ILogger<T>` in Application layer. Correlation IDs flow through middleware.

---

### Frontend Conventions
- React + Vite + Tailwind (mobile-first).
- Feature-based foldering: `/features/<entity>/components`.
- Global state: Firebase Auth + React Query (planned).
- Tests: Vitest (unit), Playwright (e2e).

---

### Testing
- Backend:  
  - Unit tests for logic.  
  - Integration tests with in-memory/test DB + test auth.  
- Frontend:  
  - Unit/UI tests coming (Vitest).  
  - End-to-end planned (Playwright).  

CI/CD runs **all tests on PRs** before deploy.

---

### CI/CD
- GitHub Actions: build → test → deploy
- PRs must be green (backend + frontend) before merge.
- Production: merge to `master` auto-deploys to production (no staging branch today; dev env may be added later).

---

## 📂 Updating Context for ChatGPT

To keep ChatGPT “in sync” across chats:
1. Keep this file updated when rules/patterns change.
2. Update `FOLDER_STRUCTURE.md` whenever repo structure changes.
3. At start of each chat, upload both files and say:  
   > “Use PROJECT_INSTRUCTIONS.md + FOLDER_STRUCTURE.md for context.”

---

## 👥 Maintainer

**Paulo Suljic**  
🔗 [GitHub](https://github.com/PauloSuljic) ・ 🌍 [giftyapp.live](https://giftyapp.live)
