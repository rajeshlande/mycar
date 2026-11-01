import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { isPublicKey, isProjectUrl } from '../src/lib/public-config.mjs';

const files = [];
function walk(dir) { for (const entry of readdirSync(dir, { withFileTypes: true })) { const path = join(dir, entry.name); if (entry.isDirectory()) walk(path); else if (/\.(jsx?|mjs|css|html)$/.test(entry.name)) files.push(path); } }
walk('src'); walk('public'); files.push('index.html', 'vite.config.js');
const failures = [];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  if (/sb_secret_[A-Za-z0-9_-]{12,}/.test(text)) failures.push(`${file}: possible secret key`);
  for (const token of text.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g) || []) {
    try { if (JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).role === 'service_role') failures.push(`${file}: service-role JWT`); } catch {}
  }
  if (/SUPABASE_SERVICE_ROLE_KEY/.test(text) && file.startsWith('src/')) failures.push(`${file}: administrative key referenced in browser source`);
}
if (existsSync('.env.local')) {
  const text = readFileSync('.env.local', 'utf8');
  const key = text.match(/^VITE_SUPABASE_ANON_KEY=(.*)$/m)?.[1]?.trim();
  const url = text.match(/^VITE_SUPABASE_URL=(.*)$/m)?.[1]?.trim();
  if (key && !isPublicKey(key)) failures.push('.env.local: invalid or privileged public-key variable');
  if (url && !isProjectUrl(url)) failures.push('.env.local: invalid project URL');
}
const worker = readFileSync('public/sw.js', 'utf8');
if (!worker.includes("request.method !== 'GET'") || !worker.includes('url.origin !== ROOT.origin')) failures.push('sw.js: API exclusion guard missing');
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`Passed: ${files.length} browser/public files checked; no privileged credentials found; static-only worker guards present.`);
