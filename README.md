# myCar

**Your personal garage.** A mobile-first, installable vehicle-expense tracker built with React, Vite, and Supabase.

myCar adapts the technical foundation of the supplied [yoga_studio reference](https://github.com/rajeshlande/yoga_studio): React + Vite, Supabase email authentication, exact INR accounting, and a PWA cache that contains public app files only. The interface, vehicle schema, and expense workflows are new. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## What is included

- **Accounts:** sign up, email confirmation, sign in, forgot password, secure password reset, and sign out.
- **Dashboard:** monthly totals, fuel and service costs, month-over-month comparison, a six-month chart, category breakdown, budget progress, and vehicle filtering.
- **Expenses:** create, edit, delete, search, category/vehicle/month/date-range filters, sorting, pagination, and filtered CSV export.
- **My vehicles:** multiple vehicles, default-vehicle selection, registration, make/model/year, fuel and transmission, colour, odometer, purchase date, care dates, notes, and individual expense history.
- **Care reminders:** upcoming or overdue insurance and service reminders, based on saved dates and odometer readings. These are **in-app only**.
- **Profile:** editable name, phone, city, and bio; account email and password-reset action.
- **Settings:** light/dark/system appearance, kilometre/mile display, monthly garage budget, reminder preferences, CSV export, privacy note, and installation help.
- **PWA:** web manifest, generated PNG/SVG icons, standalone display, install prompts where supported, and a versioned offline app shell.
- **Sample workspace:** an explicit, fictional, memory-only preview available from the sign-in screen. It never creates an account, writes to Supabase, or survives a refresh.

## Important: preview vs. connected accounts

The delivered preview starts **without Supabase credentials**. You can explore all sample-workspace features immediately, but real sign-in/sign-up and cloud saving require your own project configuration. The app does not pretend that authentication succeeded when no backend is configured.

No real Supabase project or mailbox was available during the build. SDK contract tests use intercepted responses; they are not evidence of live email delivery or hosted-project acceptance. Complete the checklist below before launch.

## Requirements

- Node.js **20.19+** (Node 22 recommended for deployment)
- npm
- A Supabase project with Email authentication enabled
- HTTPS for a deployed PWA; localhost is also a secure context for development

## 1. Install and run

```bash
npm ci

# macOS / Linux
cp .env.example .env.local

# Windows PowerShell
Copy-Item .env.example .env.local

# Edit .env.local as described below, then:
npm run dev
```

The development server binds to `0.0.0.0` and prefers port `5173`. If that port is busy, Vite automatically tries the next free port; open the URL printed in the terminal. Without credentials, use **Explore a sample workspace**. The in-app **Setup guide** explains the same configuration steps.

## 2. Create the database

Open **Supabase → SQL Editor**, paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql), and run it.

The script creates:

| Table | Purpose |
|---|---|
| `profiles` | One private profile/preferences row per authenticated user |
| `vehicles` | Owner-scoped vehicle records |
| `expenses` | Owner-scoped expenses linked to an owner-matching vehicle |

It also creates the signup-profile trigger, update timestamps, indexes, constraints, owner-only RLS policies, least-privilege grants, and an atomic `set_primary_vehicle(uuid)` function.

The file is safe to rerun for this v1 schema and does not delete business records. **Use a dedicated project.** If your project already has unrelated tables named `profiles`, `vehicles`, or `expenses`, review and resolve the collision before running it; `CREATE TABLE IF NOT EXISTS` is not a schema merger.

### Data rules

- Money is integer **paise**, never floating-point rupees. ₹1,234.50 is `123450`.
- This release uses **INR only**. There is no currency relabeling or implicit exchange-rate conversion.
- Odometers are stored in whole kilometres. Miles are converted for display/input.
- A composite `(vehicle_id, user_id)` foreign key prevents cross-account vehicle references, including updates.
- Deleting a vehicle cascades to its expenses. The UI requires explicit confirmation and states the number of affected expenses.
- Registration uniqueness is per account, ignoring whitespace and case.
- Profile identity fields and timestamps are not writable by browser clients.

## 3. Add public Supabase configuration

In **Project Settings → API**, copy the project URL and a **publishable** key (`sb_publishable_…`) or legacy **anon** JWT.

```dotenv
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-PUBLISHABLE-OR-ANON-KEY
```

Put these in `.env.local`, restart the dev server, and rebuild for deployment.

**Never put a service-role key, `sb_secret_…` key, database password, or SMTP credential in a `VITE_` variable.** Vite exposes these values to the browser. The build rejects privileged/malformed keys and non-HTTPS project URLs. Public keys are safe only when RLS and grants are configured correctly.

## 4. Configure authentication emails

In **Authentication → URL Configuration**:

1. Set **Site URL** to the full deployed app URL, including a repository path on GitHub Pages.
2. Add the exact redirect URLs used by the app:

```text
http://localhost:5173/#/login
http://localhost:5173/#/reset-password
https://YOUR-APP.example/#/login
https://YOUR-APP.example/#/reset-password
```

For GitHub Pages, use `https://YOUR-USER.github.io/YOUR-REPO/` before each hash. If local development prints a fallback port such as `5174`, allow that exact localhost origin too. Add only the preview origins you actually use; avoid an unrestricted production redirect wildcard.

Keep email confirmations enabled. The client explicitly uses the **PKCE** flow. Use Supabase’s default `{{ .ConfirmationURL }}` email-link behavior, or ensure customized templates honor the requested redirect. Open recovery links in the same browser that requested them.

The built-in Supabase email service is for testing and is rate-limited. Configure **custom SMTP** and review password/rate-limit settings before a public launch. The app uses neutral reset-success wording and maps common Auth errors without logging credentials.

## 5. First-drive checklist

- [ ] Run the schema in the intended project.
- [ ] Add public environment values and restart/rebuild.
- [ ] Configure Site URL and both redirect URLs.
- [ ] Create an account and confirm its email.
- [ ] Sign in, add a vehicle, and add/edit/delete an expense.
- [ ] Confirm a second account cannot see the first account’s records.
- [ ] Save profile, budget, distance, theme, and reminder preferences.
- [ ] Export a CSV and open it in a spreadsheet.
- [ ] Request a reset email, open it in the same browser, and set a new password.
- [ ] Sign out and confirm protected routes require sign-in.
- [ ] Deploy over HTTPS, load once online, then test the offline shell.
- [ ] Install from the browser on a real Android/iOS device.

## Commands

```bash
npm run dev              # Development on 0.0.0.0; prefers 5173, falls back if busy
npm run build            # Production build; relative base supports nested hosting
npm run build:pages      # GitHub Pages build (same relative-base output)
npm run preview          # Serve the production build on 0.0.0.0:4173
npm test                 # Pure-logic tests + real SQL/RLS tests in PGlite
npm run security:check   # Browser-source credential and worker-guard checks
npm run check:agents     # Agent docs, skill frontmatter, links, and paths
npm run check:pages      # Validate dist/ for GitHub Pages/PWA hosting
npm run version:check    # Verify package/lockfile/changelog version alignment
npm run version:patch    # Bump patch version and date changelog notes
npm run version:minor    # Bump minor version and date changelog notes
npm run version:major    # Bump major version and date changelog notes
npm run test:browser     # Production UI tests + mocked Supabase contract tests
```

Browser tests require a production build first:

```bash
npm run build
npx playwright install chromium
# Linux/CI may need: npx playwright install --with-deps chromium
npm run test:browser
```

The browser suite starts three servers: a production preview on port 4173, a fake-configured development server on port 5174 for intercepted Auth contract tests, and an always-unconfigured development server on port 5175 for setup-mode checks. All Supabase requests in authentication tests are intercepted, and the production-preview suite blocks non-local network access so it can never authenticate against a real project. No real credentials or mailbox are needed.

The preview on 4173 is built with whatever `VITE_SUPABASE_*` values are present, so it may be configured or unconfigured. Setup-mode assertions use port 5175 instead, which keeps the suite green both before and after you add repository secrets. The Playwright server environment is configured in `playwright.config.js`, so the command works on Windows, macOS, and Linux.

Executed checks and remaining live-project checks are recorded in [`docs/VERIFICATION.md`](docs/VERIFICATION.md).

## Version management

`package.json` is the version source of truth. Release notes live in [`CHANGELOG.md`](CHANGELOG.md). The bump scripts update the package, lockfile, and changelog; they do not commit, tag, or push.

```bash
npm run version:check
npm run version:patch   # or version:minor / version:major
```

See [`docs/VERSIONING.md`](docs/VERSIONING.md) for the release checklist and [`docs/GITHUB_PUSH.md`](docs/GITHUB_PUSH.md) for exact GitHub push/tag commands.

## Troubleshooting

### `Port 5173 is already in use`

The current config prefers `5173` but no longer hard-fails when it is busy. Use the URL Vite prints, or choose another port:

```bash
npm run dev -- --port 5174
```

If you want to stop the old process on Windows, first identify it:

```powershell
Get-NetTCPConnection -LocalPort 5173 -State Listen | Select-Object LocalAddress, LocalPort, OwningProcess
Get-Process -Id <PID>
```

Only stop it if you recognize it as an old Node/Vite server:

```powershell
Stop-Process -Id <PID> -Force
```

Command Prompt equivalent:

```bat
netstat -ano | findstr :5173
tasklist /FI "PID eq <PID>"
taskkill /PID <PID> /F
```

Do not kill an unknown PID. Closing the old terminal that ran `npm run dev` is often enough.

## Deployment

### GitHub Pages

The project is configured for GitHub Pages project sites (`https://USER.github.io/REPO/`) and root/custom-domain sites. It uses a relative Vite base, hash routing, relative PWA paths, and `public/.nojekyll`.

1. Push this project to a GitHub repository with the default branch `main`.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. In **Settings → Secrets and variables → Actions**, add repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (publishable or legacy anon key only)
4. Push to `main`, or run **Deploy myCar to GitHub Pages** manually from the Actions tab.
5. Open the deployed URL from the workflow’s `deploy` job.
6. In Supabase **Authentication → URL Configuration**, set the Site URL and redirect URLs to the final Pages origin, including the repository path:
   - `https://USER.github.io/REPO/#/login`
   - `https://USER.github.io/REPO/#/reset-password`

The workflow runs credential/agent checks, logic/database tests, browser tests, builds with `npm run build:pages`, validates the output with `npm run check:pages`, and deploys `dist`. If the Supabase secrets are missing, the site still deploys but opens in setup/sample mode and the workflow prints a warning.

Local Pages verification:

```bash
npm run build:pages
npm run check:pages
npm run preview -- --base=/YOUR-REPO/ --port 4175
```

Then open `http://localhost:4175/YOUR-REPO/`. Hash routing avoids server-side SPA rewrite requirements.

### Vercel, Netlify, or static hosting

- Framework/build command: `npm run build`
- Output directory: `dist`
- Set the two public environment variables before building.
- Serve over HTTPS.
- Keep `sw.js` and `precache.json` at the deployed app root and revalidate them on updates.
- Do not cache Supabase API/Auth responses at the CDN.

## Security and offline behavior

- Supabase manages passwords, sessions, email verification, and recovery. The app never stores a password itself.
- Every exposed table has RLS and explicit authenticated-only grants; anonymous table access is revoked.
- The service worker caches only the app shell, fonts, icons, manifest, and illustrative image. It excludes non-GET requests and cross-origin/API traffic.
- Private records are held in memory while signed in. There is **no offline financial-data cache or write queue**. Reconnect to load/save account data.
- The SDK’s session persistence is separate from the static cache. Theme is the only additional persistent app preference.
- Sample data is fictional and memory-only. It is not an offline authentication bypass.
- CSV export escapes quotes and neutralizes spreadsheet-formula prefixes in text cells.
- Sign out clears the current local session; it does not intentionally revoke every other device.

## Deliberate limits

- No push/email maintenance notifications; reminders appear only inside the app.
- No receipt uploads, OCR, fuel-efficiency estimation, multi-currency conversion, account deletion, or in-app email-address change.
- Vehicle images are generic illustrations, not exact photographs of each recorded model.
- A service-role key is not needed by any implemented feature.
- Publishing a production privacy policy, retention rules, support contact, and SMTP configuration remains the project owner’s responsibility.

## Agent instructions and repo-local skills

- [`AGENTS.md`](AGENTS.md) is the canonical project rule set for coding agents.
- [`CLAUDE.md`](CLAUDE.md) imports `AGENTS.md` and points Claude Code to the matching repo-local skills.
- [`.claude/skills/`](.claude/README.md) contains five task-specific skills: `mycar-supabase`, `mycar-ui`, `mycar-pwa`, `mycar-verify`, and `mycar-release`.

The supplied yoga_studio reference contained a `CLAUDE.md` but no separate installed skill directories. myCar's guidance is adapted to this app; it does not import yoga_studio's ERP roles or RPC-only data contract. These files are repository instructions, not globally installed plugins or executable hooks.

## Structure

```text
AGENTS.md           Canonical coding-agent project instructions
CLAUDE.md           Claude Code import and skill pointers
.claude/skills/     Repo-local Supabase, UI, PWA, and verification workflows
src/
  components/       Shared UI, charts, forms, layout, action dialogs
  lib/              Supabase client, auth context, data layer, logic, PWA/theme
  pages/            Auth, setup, dashboard, expenses, vehicles, profile, settings
  styles.css        Responsive light/dark design system
public/             Manifest, static-only worker, icons, fonts/licenses, hero image
supabase/           Complete idempotent schema and security policies
tests/              Logic, SQL/RLS, browser UI, mocked Auth contract tests
scripts/            Public-credential security check
```

## License

MIT. See [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
