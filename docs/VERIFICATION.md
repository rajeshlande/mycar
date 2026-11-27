# Verification update: v1.6.2

- Audited the actual myCar stack: React/Vite, not Vue or TypeScript. Vite 8.4.0 and React plugin 6.3.0 declare compatible Node engines; the React plugin requires Vite 8. Vite 8's Rolldown migration warrants testing custom plugins; the static cache plugin passed the build and Pages checks.
- Node 26.13.1 and npm 11.20.0 on Linux: clean npm ci, production and Pages builds, Pages validation, 21 logic/database tests, and 22 browser tests passed. Agent, security and version checks passed; npm audit reported zero vulnerabilities.
- Existing `.nvmrc` is the CI Node version source; CI checks npm 11.20.0 explicitly. No Dockerfile, `.node-version`, Vue plugin or TypeScript configuration was present in the repository.
- GitHub Actions deployment, live Supabase, and Windows setup have not been verified. No schema or hosted data changed.

---

# Verification update: v1.6.1

- Updated Playwright Test 1.65.1, PGlite 0.6.0, axe Playwright 4.14.1, Vite 8.4.0 and Vite React plugin 6.3.0. The Vite upgrade required isolated cache directories for the configured and unconfigured browser-test servers.
- Node 26.13.0 with npm 11.20.0: clean `npm ci`, 21 logic/database tests and 22 browser tests passed; browser tests ran against both unconfigured and simulated-configured builds. Axe automated WCAG A/AA checks cover main screens and dialogs in both themes.
- Pages build and validation, agent, security and version checks passed; `npm audit` reported zero vulnerabilities. A configured test build deliberately failed the Pages production-key guard because it contained a test-only Supabase key; the unconfigured build passed.
- A Vite 8 development server fell back from occupied port 5173 to 5174. Real Windows, physical devices, screen readers, live hosted authentication and the GitHub deployment remain unverified. No schema or hosted data changed.

---

# Verification update: v1.6.0

- Logic/database suite: 21 passed, including old-schema upgrade, idempotence, preserved categories and owner isolation for car-wash expenses.
- Browser suite: 22 passed, including creating, filtering, editing and exporting car-wash expenses; browser auth uses simulated responses.
- Pages build/validation, agent-document checks, security checks and version alignment passed.
- Hosted Supabase migration, real accounts and physical devices were not tested. Back up and test on staging before applying the canonical schema. Existing expenses are not automatically reclassified.

---

# Verification update: v1.5.2

- Logic and PGlite database suite: 20 passed.
- Playwright: 21 passed on both unconfigured and simulated-configured Pages builds, including mobile 320px expense rows, native category arrow-key selection, optional detail visibility and payment-method preservation/export. Automated axe checks run for main screens and dialogs in both themes.
- `build:pages`, `check:pages`, `check:agents`, `security:check` and `version:check` passed.
- Inspected emulated 390px expense form and list. Physical-device, screen-reader, live Supabase and live email tests remain outstanding.
- No schema changes or hosted data changes in this release.

---

# myCar verification record

Latest local verification: 2026-11-02
Environment: Node.js 20.20.2, npm 10.8.2, Chromium via Playwright, PGlite 0.5.x. Earlier owner-run Windows evidence is retained below and labeled separately.

## Executed and passing

| Check | Result |
|---|---|
| `npm test` | **14 passed**: 8 logic/config tests and 6 PostgreSQL schema/RLS tests |
| `npm run security:check` | Passed; 28 browser/public files checked, no privileged credentials found, static-only worker guards present |
| `npm run check:agents` | Passed; 8 agent/skill Markdown files, 5 skill frontmatters, local links, Claude import, and referenced project paths validated |
| `npm run version:check` | Passed; package.json, package-lock.json, and CHANGELOG.md aligned at v1.1.2 |
| `npm run build:pages` and `npm run check:pages` | Passed; relative-base production assets and Pages/PWA output validated, with and without Supabase build-time variables |
| `npm run test:browser` | **11 passed** with `CI=1` and retries disabled against **both** a configured and an unconfigured production build; focused expense/vehicle tests also passed **20 runs each**, and the setup-mode test passed **12 consecutive runs** on a configured build |
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

- Honest unconfigured sign-in and reachable setup guide, asserted on the dedicated always-unconfigured server (5175) so build-time secrets cannot change the result.
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

## Supabase-secrets CI fix — 2026-11-02 (v1.1.2)

After the owner added `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` repository secrets, Pages run `41403762885` attempt 2 failed on `unconfigured authentication is honest and setup is reachable`. Attempt 1, built before the secrets existed, had passed.

Cause: the test asserted setup-mode behaviour against the production preview on port 4173. That preview is built with whatever `VITE_SUPABASE_*` values CI supplies, so once secrets existed it became a *configured* app. Sign-in then reached the real project and returned `That email and password don’t match.` instead of the setup notice. The app behaved correctly; the test was coupled to build configuration. It also meant CI was submitting test credentials to a live Supabase project.

Fix: setup-mode assertions now run against a dedicated always-unconfigured dev server on port 5175, whose `VITE_SUPABASE_*` variables are explicitly blanked in `playwright.config.js`. Vite's `loadEnv` gives `process.env` precedence over `.env` files, so this also holds for a developer with a populated `.env.local`. The production-preview suite additionally aborts every non-local request, so it can never authenticate against a real project.

Reproduced locally by building with simulated publishable credentials, which failed the same assertion, then re-ran after the fix.

| Check | Result |
|---|---|
| `npm run version:check` | Passed at v1.1.2 |
| `npm run security:check` | Passed; 28 browser/public files |
| `npm run check:agents` | Passed; 8 Markdown files, 5 skills |
| `npm test` | 14/14 passed |
| `npm run build:pages` + `npm run check:pages` | Passed in both configured and unconfigured modes |
| `npm run test:browser` (configured build) | 11/11 passed, `CI=1 --retries=0` |
| `npm run test:browser` (unconfigured build) | 11/11 passed, `CI=1 --retries=0` |
| Setup-mode test on configured build | 12/12 consecutive runs passed, retries disabled |
| `npm audit` | 0 vulnerabilities |

Live Supabase authentication, real email delivery, and real-device PWA install remain owner-verified items. The simulated credentials used above are fictional and were never a real project.

## Vehicle and fuel support — v1.2.0

Local development verification: 16 logic/database tests, including a simulated upgrade of the original v1 schema preserving an existing vehicle and testing owner isolation; browser suite covers custom make/model, motorcycle and scooter creation, custom fuel and fuel filtering. At v1.2.0, 13/13 browser tests passed in Chromium with retries disabled against both simulated configured and unconfigured builds; check:pages, security, agents and version checks also passed. Mobile field/nav changes are included from the prior draft; automated tests cannot establish actual iOS/Android behavior. Make/model suggestions are illustrative, not exhaustive or current market coverage.

Existing Supabase installations need the updated `supabase/schema.sql` applied before the app version is deployed; no live migration has been performed. Test real devices, real signup/email and hosted database behavior independently.

## Expense payment methods — v1.3.0

Local verification: 17/17 logic and PGlite database tests passed, including a simulated upgrade of an existing expense with no assigned payment method, repeated schema application, all supported methods, invalid values and cross-user update isolation. At v1.3.0, the full Chromium browser suite passed 14/14 with retries disabled for both a simulated configured build and an unconfigured build; the new test adds, edits, displays and exports a payment method. Pages, security, version and agent checks passed. The sample workspace is memory-only; hosted Supabase writes and live migration have not been tested or performed. This is not payment processing and no card or UPI credentials are stored.

## RuPay credit card via UPI — v1.3.1

Local verification: 18/18 logic and PGlite tests passed, including an upgrade from the v1.3 payment constraint, preservation of existing UPI entries, repeat application and cross-user isolation. Production Pages build and check passed; 14/14 Chromium browser tests passed with retries disabled, including saving, editing, displaying and CSV-exporting the new payment label. Security and agent checks passed. Update the canonical `supabase/schema.sql` before deploying; no live migration was performed.

## Mobile navigation refresh — v1.4.0

Local verification: 18/18 logic/database tests; 16/16 Chromium browser tests with retries disabled against both unconfigured and simulated-configured builds; version, security, agent, Pages checks passed. Added tests for bottom navigation and 320px overflow; manually checked dashboard widths 320, 360, 390, 768, 844 landscape and 1440px and the four quick-navigation pages at 320px. A mobile dashboard axe check at 390px reported zero WCAG A/AA violations in each theme. These are emulated browser checks, not real-device or complete accessibility testing. Real iOS Safari and Android Chrome, keyboard overlay, safe-area insets, orientation and screen readers remain to be verified. No schema or live project changes are required for this UI-only release.

## Dashboard tile customization — v1.5.0

Local verification: 20/20 logic/PGlite tests passed, including prior-schema upgrade, repeat application, default visibility, JSON type/size constraints and cross-account RLS. Full browser suite passed 19/19 with retries disabled against unconfigured and simulated-configured builds. Mocked Supabase contract tests verify account-scoped profile updates, preference restoration after reload and safe failure behavior; sample tests verify hide, restore and cancel. A 320px customization dialog showed all 10 choices without horizontal page overflow and passed automated WCAG A/AA axe checks. Version, security, agents, Pages checks passed; npm audit reported 0 vulnerabilities. Mocked auth/profile tests do not verify the hosted database or actual cross-device operation. Run the canonical `supabase/schema.sql` before deployment; no live migration was performed.

## Unslop-informed UI polish — v1.5.1

Reviewed and polished with reference to [Unslop by Damir Sokolovsky](https://github.com/heydamir/unslop) (CC BY 4.0). Kept the existing myCar brand, core features and automotive visual. Increased common text/field sizes, enlarged mobile date arrows and expense row actions, used sentence case for selected navigation/eyebrow labels, clarified selected copy and fixed a narrow-screen vehicle-detail overflow while retaining the table's own horizontal scrolling.

Local checks: 20/20 logic/PGlite tests; 20/20 Chromium browser tests with retries disabled against both unconfigured and simulated-configured Pages builds. Version, security, agents and Pages checks passed; npm audit reported 0 vulnerabilities. Emulated checks covered 320, 360, 390, 768, 844 landscape and 1440px (dashboard and six primary routes); automated WCAG A/AA axe checks found no dashboard violations at 390px in either theme. The browser suite also covers modal and desktop screen scans. Some secondary labels and compact controls remain below the preferred audit targets and need further review; these checks are not a complete accessibility audit. Physical Android/iOS devices, touch-keyboard overlap and screen-reader behavior remain unverified. No database schema changes were made.
