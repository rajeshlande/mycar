# myCar — Claude Code instructions

@AGENTS.md

## Claude Code workflow

- The imported `AGENTS.md` is the canonical project rule set. Do not maintain a second divergent copy of product/security rules here.
- Read the relevant repo-local skill before matching work:
  - `.claude/skills/mycar-supabase/SKILL.md`
  - `.claude/skills/mycar-ui/SKILL.md`
  - `.claude/skills/mycar-pwa/SKILL.md`
  - `.claude/skills/mycar-verify/SKILL.md`
  - `.claude/skills/mycar-release/SKILL.md`
- Skills are task guidance only. They do not grant permission to deploy, push, run live SQL, install hooks, or access secrets.
- Keep context focused: inspect the relevant source and docs, make the smallest coherent change, run the matching checks, and report evidence.
- If this file and `AGENTS.md` appear to conflict, stop and resolve the conflict rather than choosing the more permissive rule.
