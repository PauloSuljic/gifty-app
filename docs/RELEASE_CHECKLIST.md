# Release Checklist

Last updated: 2026-03-21

This checklist is for the Gifty monorepo:

- `frontend/` -> Azure Static Web Apps
- `backend/` -> Azure Web App
- auth -> Firebase
- database -> PostgreSQL

## Release policy

- Target release model: `local` -> `development` -> `production`.
- Development is the pre-production validation environment.
- Production releases should be manual promotions, not automatic deploys on every merge.
- Do not ship backend schema changes without confirming migration and rollback behavior.

## Development checklist

### Environment readiness

- Development frontend app exists.
- Development backend app exists.
- Development database exists and is isolated from production.
- Development storage/container configuration exists if uploads are used.
- Development Firebase configuration is valid.
- Development allowed auth domains and redirect URLs are configured.
- Development frontend points to development backend.
- Development backend CORS allows the development frontend origin.
- Development environment variables and secrets are documented.

### Deployment readiness

- Target branch/commit is identified.
- CI is green:
  - backend tests
  - frontend lint
  - frontend typecheck
  - frontend build
- If migrations are included, the migration was reviewed for safety.
- If migrations are included, backup/restore implications are understood.
- Release notes or change summary is prepared.

### Functional verification in development

- Register flow works.
- Login flow works.
- Email verification flow works.
- Onboarding profile flow works.
- Onboarding birthday flow works.
- Create wishlist works.
- Edit wishlist works.
- Delete wishlist works.
- Create item works.
- Edit item works.
- Delete item works.
- Reserve/unreserve item works.
- Share link generation works.
- Shared guest wishlist view works.
- Friends/shared-with-me page works.
- Calendar page works.
- Notifications load correctly.
- Profile/settings save correctly.
- Legal pages load correctly.

### Quality verification in development

- No critical console errors on key pages.
- No critical backend exceptions in logs.
- Sentry receives events from development.
- Analytics events appear in the development/debug stream.
- Mobile layout is checked on at least one small viewport.
- Primary pages are checked on at least one desktop viewport.
- Images, fonts, and static assets load correctly.

### Release rehearsal

- Deployment steps are documented and understood.
- Manual production release steps are documented and understood.
- Rollback steps are documented and understood.
- Smoke test owner is assigned.
- Decision owner for go/no-go is assigned.

## Production checklist

### Pre-deploy

- Development verification is complete.
- Final commit/PR is identified.
- Required secrets are present in GitHub/Azure/Firebase.
- Production Firebase auth domains and redirect URLs are correct.
- Production API base URL is correct in frontend build inputs.
- Production backend connection string is correct.
- Production blob storage configuration is correct.
- Production CORS settings are correct.
- Database migration plan is approved.
- Database backup or rollback plan is confirmed.
- Monitoring dashboards are open before release.
- Sentry release/environment tags are ready.

### Deploy

- Backend deploy workflow completes successfully.
- Frontend deploy workflow completes successfully.
- Any required database migration is applied exactly once.
- Deployed versions/commits are recorded.

### Post-deploy smoke test

- Home page loads.
- Register works.
- Login works.
- Email verification path is valid.
- Authenticated dashboard loads.
- Wishlists load.
- Create/edit/delete wishlist works.
- Create/edit/delete item works.
- Reservation flow works.
- Share link works.
- Shared guest page works.
- Friends/shared-with-me page works.
- Calendar page works.
- Notifications work.
- Profile/settings update works.
- Terms and privacy pages load.

### Post-deploy monitoring

- Check backend application logs for new exceptions.
- Check frontend/browser console on key pages.
- Check Sentry for regressions.
- Check analytics for core events:
  - signup completed
  - onboarding completed
  - wishlist created
  - wishlist shared
- Confirm no unexpected spike in 4xx/5xx responses.
- Confirm response times are within acceptable range.

## Rollback checklist

- Identify whether rollback is frontend-only, backend-only, or full stack.
- If backend contract changed, verify frontend compatibility before partial rollback.
- If schema changes are not safely reversible, prefer forward-fix over destructive rollback.
- Re-deploy last known good frontend artifact if needed.
- Re-deploy last known good backend artifact if needed.
- Validate app health after rollback.
- Post incident summary is written if rollback was required.

## Nice-to-have automation follow-up

- Add development deployment workflows.
- Add manual production release workflow or runbook.
- Publish test results and coverage in CI.
- Add Playwright smoke suite for release validation.
- Add release issue template or release PR checklist.
- Add Sentry release tracking.
- Add a lightweight runbook in `docs/` for incidents and rollback ownership.
