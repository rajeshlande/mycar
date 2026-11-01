import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const errors = [];
const files = ['AGENTS.md', 'CLAUDE.md', '.claude/README.md'];
const skillRoot = '.claude/skills';
const skills = existsSync(skillRoot) ? readdirSync(skillRoot, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => join(skillRoot, e.name, 'SKILL.md')) : [];
files.push(...skills);

for (const file of files) {
  if (!existsSync(file)) { errors.push(`${file}: missing`); continue; }
  const text = readFileSync(file, 'utf8');
  if (!text.endsWith('\n') || text.endsWith('\n\n')) errors.push(`${file}: expected one final newline`);
  text.split('\n').forEach((line, i) => { if (line.trimEnd() !== line) errors.push(`${file}:${i + 1}: trailing whitespace`); });
  for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (/^(https?:|#)/.test(target)) continue;
    const path = resolve(dirname(file), target.split('#')[0]);
    if (!existsSync(path)) errors.push(`${file}: missing local link ${target}`);
  }
}

for (const file of skills) {
  if (!existsSync(file)) continue;
  const text = readFileSync(file, 'utf8');
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontmatter) { errors.push(`${file}: missing YAML frontmatter`); continue; }
  const name = frontmatter[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = frontmatter[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
  const expected = dirname(file).split('/').pop();
  if (name !== expected) errors.push(`${file}: name must match directory ${expected}`);
  if (!description || description.length > 1024) errors.push(`${file}: missing/overlong description`);
}

if (!readFileSync('CLAUDE.md', 'utf8').includes('@AGENTS.md')) errors.push('CLAUDE.md: missing @AGENTS.md import');
for (const path of ['src/lib/supabase.js', 'src/lib/data.jsx', 'supabase/schema.sql', 'public/sw.js', 'vite.config.js', 'docs/VERIFICATION.md', 'tests/database.test.mjs']) {
  if (!existsSync(path)) errors.push(`missing referenced project path ${path}`);
}

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Agent docs OK: ${files.length} Markdown files, ${skills.length} skill frontmatters, local links, import, and referenced project paths validated.`);
