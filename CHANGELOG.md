# Changelog

All notable changes to myCar are documented here. The format follows Keep a Changelog, and versions follow Semantic Versioning.

## [Unreleased]

## [1.6.1] - 2026-11-01

### Changed

- Updated Playwright Test to 1.65.1, PGlite to 0.6.0, axe Playwright to 4.14.1, and Vite and its React plugin to 8.4.0 and 6.3.0.
- Set the minimum Node version to 22.12, with Node 26 LTS used in GitHub Actions.

## [1.6.0] - 2026-11-27

### Added

- Added a Car wash expense category for vehicles, including filtering, dashboard breakdowns and CSV export.

### Deployment

- Back up and apply the updated canonical `supabase/schema.sql` before using the new category with a connected account. Existing expenses are not reclassified.

## [1.5.2] - 2026-11-01

### Changed

- Improved mobile expense rows with visible vehicle names, readable dates and larger row and pagination actions.
- Made expense categories native keyboard-accessible radio inputs and grouped optional expense details in an expandable section.
- Improved connection-note readability and shortened supporting copy based on an Impeccable-inspired UI review.

## [1.5.1] - 2026-11-26

### Changed

- Improved readability, mobile date and table-action touch targets, spacing and task-focused copy while retaining the myCar design and features. Based on the Unslop design audit by Damir Sokolovsky.
- Fixed a narrow-screen vehicle-detail page overflow while keeping the expense table horizontally scrollable.

## [1.5.0] - 2026-11-25

### Added

- Customize the dashboard by showing or hiding individual summary cards, vehicle spotlight, budget, reminders, charts and recent expenses. Signed-in preferences are saved to the account; sample choices stay in memory.

### Deployment

- Run the updated canonical `supabase/schema.sql` before deploying to add the dashboard preference column to profiles.

## [1.4.0] - 2026-11-25

### Changed

- Refreshed mobile layout with a bottom quick-navigation bar, clearer controls and safer spacing for phone screens. Desktop navigation remains unchanged.

## [1.3.1] - 2026-11-25

### Added

- RuPay credit card via UPI as a distinct expense payment method. Update the Supabase schema before deployment.

## [1.3.0] - 2026-11-25

### Added

- Optional expense payment method: UPI, credit card, debit card, cash, net banking, bank transfer, mobile wallet, cheque and other. Payment methods appear in the expense log and CSV export. Existing expenses remain unspecified.

### Deployment

- Run the updated Supabase schema before deploying; no payment processing or financial credentials are involved.

## [1.2.0] - 2026-11-02

### Added

- Cars, motorcycles, scooters and mopeds with expanded body-type choices, India-focused make/model suggestions and custom make/model entry.
- Additional fuel and powertrain suggestions including LPG, dual fuel, hybrids, hydrogen and flexible custom values. The fuel filter includes custom entries.

### Changed

- Mobile text inputs and navigation controls have larger sizing; real-device validation is still required.
- Existing Supabase projects must run the updated schema SQL before saving the new body or fuel types.

## [1.1.2] - 2026-11-02

### Fixed

- The setup-mode browser test no longer depends on the production build being unconfigured. It runs against a dedicated always-unconfigured server on port 5175, so adding `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` repository secrets no longer breaks CI.

### Changed

- The production-preview browser suite blocks all non-local network requests, so CI can never send test credentials to a real Supabase project.

## [1.1.1] - 2026-11-02

### Fixed

- Modal autofocus no longer steals focus during fast input. This fixes both expense text being inserted into the amount field (leaving the required description empty) and vehicle nickname/model corruption.
- Focus restoration happens before a replacement dialog mounts, so a closing editor cannot steal focus from its confirmation dialog.

### Changed

- Playwright uses CI-only retries and a longer test timeout; the Pages workflow uploads browser-test diagnostics on failure.
- Expense and vehicle browser tests scope inputs to their dialogs, verify field values before saving, and assert successful dialog closure. Regression checks cover delayed focus theft and focus restoration.

## [1.1.0] - 2026-11-01

### Added

- GitHub Pages deployment workflow, `.nojekyll`, and `npm run check:pages` output validation.
- Version management scripts, changelog, release guidance, and dynamic in-app version display.
- Repo-local agent instructions and task skills.

### Changed

- Development server prefers port 5173 but falls back to the next free port.
- Playwright and npm test scripts are Windows-safe.
- GitHub Actions workflow verifies Pages configuration and uses current Pages actions.

### Fixed

- Windows path normalization in security and agent-document checks.

## [1.0.0] - 2026-11-01

### Added

- Initial myCar PWA with Supabase authentication, dashboard, expense tracking, multiple vehicles, profile, settings, in-app reminders, CSV export, themes, and offline app shell.
- Supabase schema with owner-only row-level security, logic/database tests, browser tests, and setup documentation.
