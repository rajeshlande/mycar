# Changelog

All notable changes to myCar are documented here. The format follows Keep a Changelog, and versions follow Semantic Versioning.

## [Unreleased]

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
