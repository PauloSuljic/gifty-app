# Engineering Notes

## 2026-03-08 — PR #139 review follow-ups

1) Review comment: Guard token fetch so loading state always resets (`frontend/src/hooks/useWishlists.ts`)
- Next time: Keep auth token retrieval inside the same `try/finally` that controls loading flags.
- Why: token fetch can fail before API calls, and loading state must still be reset to avoid stuck spinners.

2) Review comment: `getIdToken()` awaited before protected block (`frontend/src/hooks/useWishlists.ts`)
- Next time: Treat token acquisition as part of request lifecycle error handling, not as precondition outside catch/finally.
- Why: auth refresh/network failures are part of runtime failures and should follow the same recovery path.

3) Review comment: Distinguish load failure from empty data (`frontend/src/hooks/useWishlists.ts`)
- Next time: Surface user-visible feedback on fetch failure (at minimum toast), and only show empty-state copy for successful empty responses.
- Why: users need clear difference between "no data" and "failed to load" to avoid misleading UI states.
