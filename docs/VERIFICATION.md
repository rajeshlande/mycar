# myCar verification record

Latest local verification: 2026-11-02
Environment: Node.js 20.20.2, npm 10.8.2, Chromium via Playwright, PGlite 0.5.x. Earlier owner-run Windows evidence is retained below and labeled separately.

## Executed and passing

| Check | Result |
|---|---|
| `npm test` | **14 passed**: 8 logic/config tests and 6 PostgreSQL schema/RLS tests |
| `npm run security:check` | Passed; 28 browser/public files checked, no privileged credentials found, static-only worker guards present |
| `npm run check:agents` | Passed; 8 agent/skill Markdown files, 5 skill frontmatters, local links, Claude import, and referenced project paths validated |
| `npm run version:check` | Passed; package.json, package-lock.json, and CHANGELOG.md aligned at v1.1.1 |
| `npm run build:pages` and `npm run check:pages` | Passed; relative-base production assets and Pages/PWA output validated |
| `npm run test:browser` | **11 passed** with `CI=1` and retries disabled; focused expense/vehicle tests also passed **20 runs each** with retries disabled |
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
- Expense create/edit/delete and filtered CSV download, with dialog-scoped inputs and pre-submit value assertions.
- Vehicle creation and explicit cascade-deletion confirmation, with exact card selection and model persistence checks.
- Dialog focus stays on the user-selected field beyond the old 60 ms autofocus window; closing restores focus, and replacement confirmation dialogs retain focus.
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

## Version management update

Added `scripts/version.mjs`, `CHANGELOG.md`, `docs/VERSIONING.md`, `docs/GITHUB_PUSH.md`, the `mycar-release` skill, and `version:check|patch|minor|major` npm scripts. Bumped the application from v1.0.0 to **v1.1.0** using `npm run version:minor`. The UI version is injected from `package.json`, and the service-worker cache name includes the app version plus content hash.

Executed after the version-management update: `npm run version:check`, `npm run security:check` (28 browser/public files), `npm run check:agents` (8 Markdown files / 5 skills), `npm test` (14/14), `npm run build:pages`, `npm run check:pages`, `npm run test:browser` (11/11), and `npm audit --omit=dev` (0 vulnerabilities).

## GitHub Pages readiness update

Executed after the Pages/cross-platform update:

| Check | Result |
|---|---|
| `npm test` | 14/14 passed using explicit cross-platform test file paths |
| `npm run security:check` | Passed; Windows-safe path normalization added |
| `npm run check:agents` | Passed; Windows-safe skill directory names and CRLF-tolerant Markdown checks |
| `npm run build:pages` | Passed; relative-base production build |
| `npm run check:pages` | Passed; required files, `.nojekyll`, relative paths, PWA manifest/worker, precache coverage, and build-output credential scan |
| `npm run test:browser` | 11/11 passed; Playwright fake Supabase environment moved into config for Windows compatibility |
| Nested `/mycar/` preview smoke | Passed; `.nojekyll`, sample workspace, relative manifest, scoped service worker, and offline reload |
| Dev port fallback | Passed; with 5173 occupied, `npm run dev` started on 5174 and responded |

Remote validation on 2026-11-01: the owner's public repository `rajeshlande/mycar` at commit `941048ff2b8c866dd222d457190bc6b9ada335b9` passed `npm ci`, credential scan, agent-doc check, 14 logic/database tests, and `build:pages`. Its GitHub Actions run failed at `configure-pages` because GitHub Pages was not enabled/configured for GitHub Actions; `https://rajeshlande.github.io/mycar/` returned 404. That pushed commit also predates the prepared `.nojekyll`, `check:pages`, Windows-safe scripts, and dev-port fallback updates.

Update: GitHub Pages was subsequently enabled and deployment succeeded in run `41338907045`; the public site is live. The later v1.1.0 run `41339075459` failed in browser tests, so the v1.1.1 form fix still needs to be pushed and deployed. Adding the public Supabase secrets remains an owner configuration task.

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

## CI browser-test hardening and vehicle-form fix — 2026-11-02

The latest GitHub Actions run failed in `npm run test:browser`. The failure was reproduced locally against the production build: the modal's delayed autofocus could steal focus while the vehicle form was being filled quickly, producing a corrupted nickname/model and a failed detail-page assertion.

Fixed by moving modal autofocus to a synchronous layout effect, scoping the vehicle test to the dialog, and selecting the created vehicle card explicitly. The focused vehicle test passed 10 repeated production-build runs. Playwright also uses a 60-second test timeout and 2 retries only in CI, and the Pages workflow uploads `test-results/` / `playwright-report/` as a short-lived artifact when the job fails.

## Expense-dialog regression fix — 2026-11-02

The owner's CI log also showed the expense dialog remaining open after Save. Repeating the old v1.1.0 expense test 12 times reproduced the failure twice. The failure screenshot showed `123.45Test b` in the amount field and an empty required description: the same delayed autofocus timer had redirected typing into the wrong input.

The shared synchronous-focus fix covers both forms. Focus restoration now runs in layout-effect cleanup before a replacement dialog mounts. Expense and vehicle tests assert field values before submission, scope controls to the active dialog, and verify closure. After the fix, each focused test passed 20 consecutive production-build runs with `CI=1` and `--retries=0` (40 total), and the full browser suite passed 11/11 with retries disabled.

## v1.1.1 local validation — 2026-11-02

Bumped to **v1.1.1** with `npm run version:patch`. Executed: `npm run version:check`, `npm run security:check` (28 files), `npm run check:agents` (8 Markdown files / 5 skills), `npm test` (14/14), `npm run build:pages`, `npm run check:pages`, `npm run test:browser` (11/11), and `npm audit --omit=dev` (0 vulnerabilities). The focused vehicle-form browser test also passed 10 repeated runs.

Remote/live status at check time: `rajeshlande/mycar` main was v1.1.0, tag `v1.1.0` existed, and `https://rajeshlande.github.io/mycar/` loaded successfully with service worker scope `/mycar/` and UI version v1.1.0. The live site still showed “Accounts aren’t connected yet,” and the workflow warned that Supabase Actions secrets were not configured.

## Release validation — 2026-11-02

Environment: Node.js 22.18.0, npm 11.12.1, Windows, Chromium via Playwright.

| Check | Result |
|---|---|
| `npm ci` | Passed; 0 vulnerabilities reported |
| `npm run version:check` | Passed; package, lockfile, and changelog aligned at v1.1.0 |
| `npm run security:check` | Passed; 28 browser/public files checked, no privileged credentials found, static-only worker guards present |
| `npm run check:agents` | Passed; 8 Markdown files and 5 skill frontmatters validated |
| `npm test` | 14/14 logic and PGlite database tests passed |
| `npm run build:pages` and `npm run check:pages` | Passed |
| `npm run test:browser` | 11/11 passed against the production build and fake Auth server |
| `npm audit` | 0 vulnerabilities reported |

These checks do not verify a live Supabase project or successful GitHub Pages deployment.

## Pages deployment rerun fix — 2026-11-02

The failed deployment run `41338102553` had two successful build attempts, each uploading an artifact named `github-pages`. The deploy action therefore found two same-name artifacts and stopped. The Pages workflow now names the artifact with `github.run_attempt` and configures the deploy action to select that exact attempt's artifact. The fix was pushed in commit `b372763`; GitHub Actions run `41338907045` completed successfully, including the Pages deployment.
