---
name: mycar-supabase
description: Use when changing myCar's Supabase schema, RLS policies, Auth flows, data layer, public environment configuration, or account-scoped queries.
---

# myCar Supabase workflow

## Boundary

myCar uses direct table access protected by RLS and least-privilege grants, plus the owner-scoped `set_primary_vehicle` RPC. It is not the yoga_studio RPC-only ERP. Do not import organization/branch roles or apply yoga_studio's data contract here.

## Before editing

1. Read `AGENTS.md`, `README.md`, `supabase/schema.sql`, `src/lib/supabase.js`, and `src/lib/data.jsx`.
2. Identify whether the task changes schema, authorization, Auth UI, query shape, or only documentation.
3. Check Git status and preserve unrelated edits.
4. Never request or use a service-role/secret key in browser code. Do not run live SQL without explicit authorization.

## Schema rules

- Keep the current schema in the single `supabase/schema.sql` file unless a migration strategy is explicitly approved.
- Preserve integer paise/INR, canonical kilometres, owner-only RLS, explicit grants, and the composite `(vehicle_id, user_id)` foreign key.
- Keep signup-profile creation in the Auth trigger. Do not add duplicate profile writes from the client.
- Review security-definer functions for fixed `search_path`, explicit owner predicates, and revoked public/anon execution.
- Keep changes idempotent and non-destructive. Do not drop tables or delete business data as a shortcut.

## Client rules

- Use only `VITE_SUPABASE_URL` and a publishable/legacy anon key. Keep build-time validation.
- Preserve PKCE, neutral password-reset wording, safe error mapping, and base-path-aware `#/login` / `#/reset-password` redirects.
- Keep account reads scoped and paginated. Mutations must confirm affected rows; do not report success before Supabase confirms.
- Do not add persistent private caches or offline writes without an approved design.

## Verify

```sh
npm test
npm run security:check
npm run build
npm run test:browser
```

For schema/RLS work, ensure `tests/database.test.mjs` covers both allowed and denied cases. For Auth work, ensure mocked contract tests cover redirects and session requirements. Mocked tests are not live email or hosted-project UAT; record that distinction in `docs/VERIFICATION.md`.
