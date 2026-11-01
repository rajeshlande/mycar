# Claude Code project files

This directory contains **repo-local instructions and skills** for myCar.

- Root `CLAUDE.md` imports root `AGENTS.md`.
- `skills/*/SKILL.md` files provide task-specific workflows.
- No global plugins, executable hooks, MCP servers, or third-party skill packs are installed by this repository.

The skills are deliberately scoped to myCar. They do not carry over yoga_studio's ERP roles, RPC-only data contract, or deployment assumptions.

## Available skills

| Skill | Use when |
|---|---|
| `mycar-supabase` | Changing schema, RLS, Auth, data access, or public Supabase configuration |
| `mycar-ui` | Changing pages/components, forms, charts, responsive layout, themes, or accessibility |
| `mycar-pwa` | Changing manifest, icons, service worker, offline behavior, installability, or nested hosting |
| `mycar-verify` | Choosing checks, reproducing bugs, recording evidence, or preparing a release |

Do not add executable hooks or install external skills merely because a document links to them.
