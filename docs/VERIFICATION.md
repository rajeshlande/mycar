# myCar verification record

Date: 2026-11-01
Environment: Node.js 20.20.2, npm 10.8.2, Chromium via Playwright, PGlite 0.5.x.

## Executed and passing

| Check | Result |
|---|---|
| `npm test` | **14 passed**: 8 logic/config tests and 6 PostgreSQL schema/RLS tests |
| `npm run security:check` | Passed; 27 browser/public files checked, no privileged credentials found, static-only worker guards present |
| `npm run check:agents` | Passed; 7 agent/skill Markdown files, 4 skill frontmatters, local links, Claude import, and referenced project paths validated |
| `npm run build` | Passed; production assets generated |
| `npm run test:browser` | **11 passed** against the production build and a fake-configured Auth test server |
| `npm audit --omit=dev` | 0 vulnerabilities reported at verification time |

### Database coverage

The actual `supabase/schema.sql` was executed twice in PGlite with a minimal Auth schema and PostgreSQL roles. Tests verify:

- Idempotent setup and signup-profile creation.
- RLS enabled on all three exposed tables.
- Two authenticated users cannot read, update, or delete each other's records.
- Anonymous table access is denied.
- Profile identity/insert permissions are restricted.
- Cross-account vehicle references and expense reassignment are rejected.
- Negative money, non-fuel litre entries, unsupported currency, and duplicate registrations are rejected.
- Primary-vehicle switching is owner-scoped and atomic; anonymous execution is denied.
- Vehicle deletion cascades to its expenses.

PGlite exercises real PostgreSQL semantics locally, but is **not** a hosted Supabase project. Supabase default grants, Auth triggers, API roles, and project-specific configuration still require the live checklist in the README.

### Browser coverage

- Honest unconfigured sign-in and reachable setup guide.
- Sample dashboard vehicle filtering.
- Expense create/edit/delete and filtered CSV download.
- Vehicle creation and explicit cascade-deletion confirmation.
- Profile editing, budget/distance preferences, and dark theme.
- Mobile navigation and no horizontal page overflow at 390 px.
- Production offline reload after service-worker installation.
- Additional manual browser check: nested `/myCar/` deployment, scoped worker, sample navigation, and offline reload all passed.
- Cache contains no Auth/REST API responses.
- Automated axe-core WCAG A/AA checks on the main screens, expense dialog, and light/dark themes.
- Supabase SDK sign-in, account-scoped reads, and local sign out.
- Signup metadata, PKCE challenge, and confirmation redirect.
- Neutral password recovery request, cooldown, redirect, and authenticated password update.
- Password reset rejected without a session.

All Supabase traffic in Auth contract tests was intercepted. The fake publishable key and JWTs in tests are not real credentials. Automated accessibility checks are not a substitute for manual assistive-technology testing.

## Agent guidance update

Added `AGENTS.md`, `CLAUDE.md`, `.claude/README.md`, four repo-local skills (`mycar-supabase`, `mycar-ui`, `mycar-pwa`, `mycar-verify`), and `scripts/check-agent-docs.mjs`. The reference yoga_studio repository contained `CLAUDE.md` but no separate installed skill directories at the reviewed revision. myCar's guidance is app-specific and does not import yoga_studio's ERP/RPC-only rules.

This update changes documentation, a validation script, package script metadata, and the Pages workflow's check step; it does not change app runtime source. The agent-doc check and credential scan were rerun and passed. No global plugins, hooks, or third-party skill packs were installed.

## Not yet verified against a live project

No Supabase URL/key or test mailbox was supplied. The following remain owner acceptance tasks:

- Hosted schema execution and API exposure.
- Real email confirmation and recovery delivery, including SMTP and rate limits.
- Exact production/preview redirect allow-list behavior.
- Cross-account checks using two real hosted sessions.
- Real-device installation and iOS/Android browser behavior.
- Production hosting headers, backups, retention, and support/privacy documents.

The app intentionally does not claim these are complete. The sample workspace is not evidence of cloud persistence.
