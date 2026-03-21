# Milestone 2 Plan: Launch-Ready Web

Last updated: 2026-03-21

## Context

There is a planning conflict in the repo docs:

- `docs/PROJECT_INSTRUCTIONS.md` says Milestone 2 is "Mobile goes live".
- Current product direction is focused on making the web app launch-ready.

Planning decision:

- Treat this document as the active Milestone 2 plan for the current phase of Gifty.
- Do not start React Native or SignalR work until the web product is stable, measurable, and releasable.

## Related GitHub work

This plan is reflected in the Milestone 2 issue set on GitHub, including:

- launch-blocking flow audit
- Sentry and analytics setup
- development environment and manual production release
- frontend test coverage and quality tooling
- premium UX polish
- email verification UX
- admin portal scoping
- notification architecture improvements

## Current repo reality

What already exists:

- Backend architecture is in good shape: ASP.NET Core 8, MediatR/CQRS, validation, centralized exception handling, Serilog.
- Backend has unit and integration tests.
- Frontend has lint, typecheck, and production build in CI.
- Production deployment exists for backend and frontend through GitHub Actions and Azure.
- Core web product exists: landing, auth, onboarding, dashboard, wishlists, shared flows, profile, settings, calendar, notifications.

What is still missing for a professional launch:

- No dedicated development environment documented or automated.
- No frontend test suite in place yet.
- No observability stack for client/server errors.
- No product analytics for activation, sharing, or retention.
- No coverage reporting in CI.
- No opinionated formatting toolchain like CSharpier or Prettier.
- Landing page is functional but not premium yet.
- Release operations are not documented as a repeatable checklist.

## Assumptions

- The immediate goal is a polished public web launch, not mobile.
- The highest business risk is shipping a product that looks complete but is hard to monitor, debug, or iterate on.
- The next 4 to 8 weeks should optimize for reliability, trust, onboarding completion, and first-user retention.

## Risks If These Assumptions Are Wrong

- If mobile is actually the next priority, this plan delays it intentionally.
- If the target launch is private/beta only, some marketing and premium-brand work can be reduced.
- If infrastructure budget is near zero, tooling choices should stay minimal and favor one analytics tool plus one error tool.

## Milestone 2 Goals

1. Make the web app launch-safe.
2. Make user behavior measurable.
3. Make releases repeatable.
4. Make the product feel premium enough to support word of mouth.
5. Avoid premature expansion into mobile, investors, or heavy infrastructure.

## Recommended Epics

### Epic 1: Stabilize Milestone 1 and close launch bugs

Purpose:

- Clear the highest-risk bugs and edge cases in auth, onboarding, wishlists, shared flows, notifications, and calendar.

Scope:

- Audit the main flows end-to-end:
  - register
  - login
  - email verification
  - profile onboarding
  - birthday onboarding
  - create/edit/delete wishlist
  - create/edit/delete item
  - reserve/unreserve item
  - share wishlist
  - shared guest flow
  - friends/shared-with-me flow
  - notifications
  - profile/settings
- Convert known fragile flows into regression tests.
- Triage bugs into:
  - launch blockers
  - post-launch
  - polish

Exit criteria:

- No known P0/P1 defects in core flows.
- Every core flow has at least one backend integration test or frontend/e2e regression path.

### Epic 2: Observability and success metrics

Purpose:

- See breakage early and understand whether the product is actually being used successfully.

Recommendation:

- Add Sentry now for frontend and backend.
- Add one product analytics tool now.
- Defer Grafana until infrastructure complexity justifies it.

Tool decision:

- `Sentry`: Yes now.
  Why: best immediate value for catching frontend crashes, backend exceptions, and release regressions.
- `Mixpanel`: Yes, if the main question is activation and retention.
  Why: good for funnel tracking and event analytics.
- `Grafana`: Not yet.
  Why: current stack is not using OpenTelemetry or service-level infra instrumentation, and Grafana will add setup cost before it adds much decision value.
- If infra metrics become important later, prefer Azure Monitor/Application Insights first because deployment is already on Azure.

Recommended M2 metrics:

- Visitor to registration conversion
- Registration to verified account conversion
- Verified account to onboarding complete conversion
- Onboarding complete to first wishlist created
- Wishlist created to first item added
- Wishlist created to first share link generated
- Shared link viewed to reservation made
- Weekly active users
- D1 / D7 retention
- Average wishlists per active user
- Percentage of items with images

Suggested event taxonomy:

- `signup_started`
- `signup_completed`
- `email_verified`
- `onboarding_profile_completed`
- `onboarding_birthday_completed`
- `wishlist_created`
- `wishlist_shared`
- `wishlist_item_created`
- `wishlist_item_reserved`
- `shared_wishlist_viewed`
- `notification_opened`

Exit criteria:

- Sentry releases and environments wired for frontend and backend.
- Product funnel dashboard visible to the team.
- At least one weekly review ritual based on real metrics.

### Epic 3: Quality gates and engineering professionalism

Purpose:

- Reduce avoidable regressions and make the codebase easier to maintain.

Recommended additions:

- Backend:
  - CSharpier for formatting
  - `dotnet format` or analyzer enforcement in CI
  - test result publishing and coverage artifact generation
- Frontend:
  - Prettier
  - Vitest for unit/component tests
  - Playwright for happy-path smoke tests
  - CI gate for frontend tests once stable
- Repository:
  - Codecov after coverage reports are stable in CI
  - PR template updates for rollout/testing notes

Safe default:

- Do not run large repo-wide formatting churn in one pass.
- Introduce formatter configs first, then format only touched files or one subsystem per PR.

Coverage recommendation:

- Yes, set up Codecov in M2.
- Backend already references `coverlet.collector`, so the main work is producing reports in CI and uploading them.
- Frontend coverage should wait until there are real Vitest tests to report.

Exit criteria:

- Formatting tools are configured and documented.
- Frontend test foundation exists.
- Coverage is reported in CI and visible in PRs.

### Epic 4: Launch UX and premium presentation

Purpose:

- Make the product feel deliberate, trustworthy, and worth sharing.

Repo-grounded observation:

- The current landing page in `frontend/src/pages/Home.tsx` is extremely minimal. It works, but it does not yet sell the product or build trust.

Recommended focus areas:

- Landing page story:
  - stronger headline
  - product screenshots
  - clearer value proposition
  - trust signals
  - feature sections
  - polished footer/legal/contact presentation
- Product polish:
  - better empty states
  - improved image handling
  - consistent iconography
  - higher-quality typography and spacing
  - cleaner state transitions and loading/error states
- Premium audit with Codex + screenshots/Figma:
  - capture current screens
  - identify visual hierarchy issues
  - propose 3 to 5 targeted redesign passes
  - implement incrementally, not as a full rewrite

Three.js recommendation:

- Probably overkill for M2.
- Only use it if there is a single high-value landing-page concept that materially improves brand perception without hurting performance.
- Safer default: premium motion, better typography, layered backgrounds, and strong screenshots before adding 3D.

Exit criteria:

- Landing page is launch-ready and visually intentional.
- Key logged-in screens have consistent visual hierarchy.
- Mobile and desktop both feel polished.

### Epic 5: Release operations and environment readiness

Purpose:

- Make releases boring and safe.

Target release model:

- `local` -> `development` -> `production`
- development replaces the old staging role
- production should move behind a manual release step instead of deploying directly on every merge to `master`

Recommended work:

- Create development frontend and development backend environments.
- Add development secrets and environment documentation.
- Add development deploy workflows.
- Define a manual promotion/release process from development to production.
- Define migration, smoke-test, and rollback procedure.
- Add release checklist for development and production.

Exit criteria:

- Development exists and mirrors production closely enough for confidence.
- Production releases happen through a repeatable manual release checklist.

### Epic 6: Go-to-market and launch growth

Purpose:

- Treat launch as a repeatable acquisition experiment, not just a deployment.

Recommended launch channels:

- personal network and friend/family beta
- Product Hunt style launch only if the landing page and onboarding are strong enough
- short-form social content showing real use cases
- creator/lifestyle gift-planning angle
- SEO pages only after core launch messaging is stable

Marketing deliverables:

- positioning statement
- landing page messaging pass
- launch announcement copy
- screenshot pack / short demo video
- onboarding email or verification email polish
- simple referral/share loop messaging

Success criteria:

- Define what counts as launch success before launching:
  - number of activated users
  - percentage who complete onboarding
  - percentage who create and share a wishlist
  - qualitative feedback from first 20 to 50 real users

## Recommended sequencing

### Phase 1: Launch safety

- Epic 1: Stabilize Milestone 1 bugs
- Epic 2: Sentry + analytics foundation
- Epic 5: development environment + release process

### Phase 2: Quality and confidence

- Epic 3: formatter, tests, coverage, Codecov
- Close remaining P2 defects

### Phase 3: Perception and growth

- Epic 4: premium UX/landing page polish
- Epic 6: launch marketing assets and release campaign

## Suggested GitHub epic breakdown

### Epic A: Launch Stability

- Audit core user journeys
- Fix launch-blocking bugs
- Build regression checklist
- Add missing tests for risky flows

### Epic B: Monitoring and Metrics

- Add Sentry to frontend
- Add Sentry to backend
- Add Mixpanel event taxonomy
- Build launch dashboard

### Epic C: Engineering Quality

- Add CSharpier
- Add Prettier
- Add Vitest
- Add Playwright smoke tests
- Add coverage upload and Codecov

### Epic D: Release Readiness

- Create development environments
- Add development deployment workflow
- Define manual production release flow
- Document secrets and environment parity
- Add smoke test and rollback runbook

### Epic E: Premium Web Experience

- Redesign landing page
- Improve dashboard/wishlist visual hierarchy
- Audit empty/loading/error states
- Prepare screenshot-based design review loop

### Epic F: Launch and Growth

- Write launch messaging
- Prepare release assets
- Plan launch week distribution
- Gather beta feedback and iterate

## Strategy recommendation

The best professional version of Gifty is not "more tools". It is:

- stable core flows
- visible errors
- measurable activation
- disciplined releases
- a sharper first impression

That is the highest-leverage M2.

## Investor recommendation

Default recommendation:

- Do not optimize for investors yet.
- Optimize for proof.

What to prove first:

- people complete onboarding
- people create wishlists
- people share them
- friends use the shared links
- some percentage returns

When investors become worth the time:

- after you have early retention, strong qualitative love, or credible growth loops
- or when you have a clear reason capital will accelerate something already working

Until then, investor outreach is likely lower leverage than:

- improving launch quality
- getting real users
- measuring retention
- tightening the product story

## First 30-day execution plan

Week 1:

- define launch blockers
- add Sentry
- choose and wire Mixpanel
- draft development environment and release plan

Week 2:

- fix top launch bugs
- add Vitest foundation
- add Playwright happy-path smoke tests
- add formatter configs

Week 3:

- add Codecov
- complete release checklist and rollback process
- polish landing page and onboarding copy

Week 4:

- run development release rehearsal
- collect screenshots and do premium UI pass
- prepare launch assets and feedback loop

## Explicit non-goals for this milestone

- React Native app
- SignalR real-time architecture
- deep infra platform work
- investor deck optimization before usage proof
- complex 3D frontend experiments without performance budget and clear UX value
