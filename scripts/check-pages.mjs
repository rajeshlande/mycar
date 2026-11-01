import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const dist = 'dist';
const errors = [];
const required = [
  'index.html', '.nojekyll', 'manifest.webmanifest', 'sw.js', 'precache.json',
  'icon.svg', 'icon-192.png', 'icon-512.png', 'images/suv-forest.webp',
];

if (!existsSync(dist)) {
  console.error('dist/ is missing. Run npm run build:pages first.');
  process.exit(1);
}
for (const file of required) {
  if (!existsSync(join(dist, file))) errors.push(`dist/${file}: missing`);
}

const index = existsSync(join(dist, 'index.html')) ? readFileSync(join(dist, 'index.html'), 'utf8') : '';
if (!index.includes('id="root"')) errors.push('dist/index.html: missing app root');
if (/(?:src|href)=["']\//.test(index)) errors.push('dist/index.html: root-absolute asset path breaks nested GitHub Pages hosting');

const manifestPath = join(dist, 'manifest.webmanifest');
if (existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    if (manifest.start_url !== './') errors.push('manifest.webmanifest: start_url must be relative (./)');
    if (manifest.scope !== './') errors.push('manifest.webmanifest: scope must be relative (./)');
    for (const icon of manifest.icons || []) {
      if (/^(https?:|\/)/.test(icon.src || '')) errors.push(`manifest.webmanifest: icon ${icon.src} must be relative`);
    }
  } catch { errors.push('manifest.webmanifest: invalid JSON'); }
}

const workerPath = join(dist, 'sw.js');
if (existsSync(workerPath)) {
  const worker = readFileSync(workerPath, 'utf8');
  if (worker.includes('__BUILD_ID__')) errors.push('dist/sw.js: build version placeholder was not replaced');
  if (!worker.includes("request.method !== 'GET'") || !worker.includes('url.origin !== ROOT.origin')) errors.push('dist/sw.js: static-only API exclusion guard missing');
}

let precache = [];
const precachePath = join(dist, 'precache.json');
if (existsSync(precachePath)) {
  try {
    precache = JSON.parse(readFileSync(precachePath, 'utf8'));
    if (!Array.isArray(precache)) throw new Error('not an array');
    if (!precache.includes('./')) errors.push('precache.json: app shell ./ entry missing');
    for (const path of precache) {
      if (typeof path !== 'string' || /^(https?:|\/)/.test(path) || path.includes('..')) {
        errors.push(`precache.json: unsafe or non-relative path ${path}`);
        continue;
      }
      const local = path === './' ? 'index.html' : path.replace(/^\.\//, '');
      if (!existsSync(join(dist, local))) errors.push(`precache.json: listed file missing dist/${local}`);
    }
  } catch { errors.push('precache.json: invalid JSON'); }
}

if (existsSync(join(dist, 'assets'))) {
  for (const file of readdirSync(join(dist, 'assets'))) {
    if (!precache.includes(`./assets/${file}`) && !precache.includes(`assets/${file}`)) {
      errors.push(`precache.json: built asset not listed assets/${file}`);
    }
  }
}

const textFiles = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (/\.(jsx?|mjs|css|html|json|webmanifest|svg|txt)$/.test(entry.name)) textFiles.push(path);
  }
}
walk(dist);
for (const file of textFiles) {
  const text = readFileSync(file, 'utf8');
  const name = relative(process.cwd(), file).split(sep).join('/');
  if (/sb_secret_[A-Za-z0-9_-]{12,}/.test(text)) errors.push(`${name}: possible secret key in build output`);
  if (/SUPABASE_SERVICE_ROLE_KEY/.test(text)) errors.push(`${name}: administrative key name in build output`);
  if (/sb_publishable_browser_test_key_not_a_real_key/.test(text)) errors.push(`${name}: test-only Supabase key in build output`);
  for (const token of text.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g) || []) {
    try {
      if (JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).role === 'service_role') errors.push(`${name}: service-role JWT in build output`);
    } catch {}
  }
}

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`GitHub Pages build OK: ${required.length} required files, relative paths, PWA manifest/worker, precache coverage, and ${textFiles.length} text assets checked.`);
