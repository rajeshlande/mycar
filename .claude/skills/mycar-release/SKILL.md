---
name: mycar-release
description: Use when bumping myCar's version, preparing changelog/release notes, tagging a release, or pushing a release to GitHub.
---

# myCar release workflow

## Source of truth

`package.json` owns the application version. Keep `package-lock.json`, `CHANGELOG.md`, the Vite-injected UI version, and the service-worker cache prefix aligned. Use `npm run version:check` to verify.

## Before bumping

1. Read `AGENTS.md`, `docs/VERSIONING.md`, and `CHANGELOG.md`.
2. Inspect Git status. Do not overwrite unrelated edits.
3. Put pending release notes under `## [Unreleased]`.
4. Choose SemVer intentionally: patch for fixes, minor for additive features, major for breaking changes.

## Bump

```sh
npm run version:patch
npm run version:minor
npm run version:major
```

The script updates files only. It does not commit, tag, push, deploy, or run live SQL.

## Verify

```sh
npm run version:check
npm run security:check
npm run check:agents
npm test
npm run build:pages
npm run check:pages
npm run test:browser
```

## Commit, tag, push

Only push/tag when the user has authorized that action.

```sh
git add .
git commit -m "Release vX.Y.Z"
git tag -a vX.Y.Z -m "myCar vX.Y.Z"
git push origin main
git push origin vX.Y.Z
```

For GitHub Pages deployment, ensure the repository has Pages enabled with GitHub Actions as the source. See `docs/GITHUB_PUSH.md`. Never claim a push or deployment succeeded without evidence.
