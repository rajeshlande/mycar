# Version management

myCar uses Semantic Versioning: `MAJOR.MINOR.PATCH`.

- **MAJOR**: breaking schema/API/deployment changes or incompatible data behavior.
- **MINOR**: new features, new screens, or additive schema changes that remain backward-compatible.
- **PATCH**: bug fixes, documentation/tooling corrections, and safe maintenance changes.

`package.json` is the version source of truth. The same version must appear in:

- `package-lock.json` root version and `packages[""].version`
- the latest dated release section in `CHANGELOG.md`
- the in-app footer/settings version, injected by Vite as `__APP_VERSION__`
- the service-worker cache name, combined with a content hash

## Commands

```bash
npm run version:check    # Verify package, lockfile, and changelog alignment
npm run version:patch    # 1.1.0 -> 1.1.1
npm run version:minor    # 1.1.0 -> 1.2.0
npm run version:major    # 1.1.0 -> 2.0.0
```

The bump scripts:

1. Move the current `CHANGELOG.md` `[Unreleased]` notes into a dated release section.
2. Update `package.json` and `package-lock.json`.
3. Leave Git commits, tags, and pushes to you.

They do not deploy, run SQL, or push to GitHub.

## Release checklist

1. Add release notes under `## [Unreleased]` in `CHANGELOG.md`.
2. Run the appropriate bump command.
3. Review the generated changelog section.
4. Run checks:

```bash
npm run version:check
npm run security:check
npm run check:agents
npm test
npm run build:pages
npm run check:pages
npm run test:browser
```

5. Commit the release:

```bash
git add .
git commit -m "Release v1.1.0"
```

6. Tag and push:

```bash
git tag -a v1.1.0 -m "myCar v1.1.0"
git push origin main
git push origin v1.1.0
```

Replace `v1.1.0` with the version printed by the bump script.

## GitHub Pages

Pushing to `main` triggers `.github/workflows/pages.yml` when GitHub Pages is enabled with GitHub Actions as the source. Tags are for release history; the Pages workflow deploys from `main`.

See [`GITHUB_PUSH.md`](GITHUB_PUSH.md) for the full push sequence.
