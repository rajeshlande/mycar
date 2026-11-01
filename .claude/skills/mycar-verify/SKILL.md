---
name: mycar-verify
description: Use when selecting tests for a myCar change, reproducing a bug, reviewing release readiness, recording verification evidence, or checking documentation-only changes.
---

# myCar verification workflow

## Choose the smallest relevant evidence

| Change | Minimum checks |
|---|---|
| Docs/agent instructions only | `npm run check:agents`; `git diff --check` when Git is available |
| Pure logic | `npm test`; add a focused regression test |
| Schema/RLS/Auth/data | `npm test`, `npm run security:check`, `npm run build`, `npm run test:browser` |
| UI/responsive/theme | `npm run build`, `npm run test:browser`, visual/console inspection |
| PWA/deployment | Build, browser offline checks, root and nested-path smoke test |
| Release | Relevant checks above, dependency audit, README/verification consistency |

## Rules

1. Read `AGENTS.md`, inspect Git status, and identify acceptance criteria before running checks.
2. Reproduce bugs with a failing check where feasible. Do not weaken a test merely to make it pass.
3. Build before browser tests; the production suite serves `dist`.
4. Keep fake Supabase credentials/JWTs confined to tests. Never substitute them for live-project acceptance.
5. Distinguish PGlite SQL tests from hosted Supabase tests, and mocked Auth from real email delivery.
6. Do not mark live SMTP, redirect allow-list, real-device install, backups, or production deployment as verified without evidence.
7. Update `docs/VERIFICATION.md` with commands actually run, results, environment, and remaining owner checks.

## Common commands

```sh
npm test
npm run security:check
npm run check:agents
npm run build
npm run test:browser
npm audit
```

For documentation-only work, app builds/browser tests are unnecessary unless runtime or configuration changed. Report checks actually run, not hypothetical results. Pattern scans and axe-core runs are useful but are not complete security or accessibility audits.
