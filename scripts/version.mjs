import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const command = process.argv[2] || 'check';
const packagePath = 'package.json';
const lockPath = 'package-lock.json';
const changelogPath = 'CHANGELOG.md';
const semver = /^(\d+)\.(\d+)\.(\d+)$/;

function fail(message) {
  console.error(message);
  process.exit(1);
}

function readJson(path) {
  if (!existsSync(path)) fail(`${path} is missing.`);
  try { return JSON.parse(readFileSync(path, 'utf8')); }
  catch { fail(`${path} is not valid JSON.`); }
}

function parse(version) {
  const match = semver.exec(version || '');
  if (!match) fail(`Invalid semantic version: ${version}`);
  return match.slice(1).map(Number);
}

function nextVersion(version, type) {
  const [major, minor, patch] = parse(version);
  if (type === 'major') return `${major + 1}.0.0`;
  if (type === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function readChangelog() {
  if (!existsSync(changelogPath)) fail(`${changelogPath} is missing.`);
  return readFileSync(changelogPath, 'utf8').replace(/\r\n/g, '\n');
}

function check() {
  const pkg = readJson(packagePath);
  const lock = readJson(lockPath);
  const changelog = readChangelog();
  parse(pkg.version);
  if (lock.version !== pkg.version) fail(`package-lock.json version ${lock.version} does not match package.json ${pkg.version}.`);
  if (lock.packages?.['']?.version !== pkg.version) fail('package-lock.json packages[""].version does not match package.json.');
  if (!changelog.includes('## [Unreleased]')) fail('CHANGELOG.md must keep an [Unreleased] section.');
  const heading = new RegExp(`## \\[${pkg.version.replace(/\./g, '\\.')}\\] - \\d{4}-\\d{2}-\\d{2}`);
  if (!heading.test(changelog)) fail(`CHANGELOG.md is missing a dated [${pkg.version}] release section.`);
  const firstRelease = changelog.match(/## \[(\d+\.\d+\.\d+)\] - \d{4}-\d{2}-\d{2}/);
  if (firstRelease && firstRelease[1] !== pkg.version) fail(`CHANGELOG.md latest release is ${firstRelease[1]}, but package.json is ${pkg.version}.`);
  console.log(`Version OK: myCar v${pkg.version}; package.json, package-lock.json, and CHANGELOG.md are aligned.`);
}

function bump(type) {
  const pkg = readJson(packagePath);
  const lock = readJson(lockPath);
  const changelog = readChangelog();
  const previous = pkg.version;
  const next = nextVersion(previous, type);
  if (changelog.includes(`## [${next}]`)) fail(`CHANGELOG.md already contains [${next}].`);
  const unreleased = changelog.match(/## \[Unreleased\][^\n]*\n([\s\S]*?)(?=\n## \[|$)/);
  if (!unreleased) fail('CHANGELOG.md must keep an [Unreleased] section to release.');
  const notes = unreleased[1].trim() || '### Changed\n- Maintenance release.';
  const date = new Date().toISOString().slice(0, 10);

  pkg.version = next;
  lock.version = next;
  if (lock.packages?.['']) lock.packages[''].version = next;

  const updated = changelog.replace(unreleased[0], `## [Unreleased]\n\n## [${next}] - ${date}\n\n${notes}\n`);
  writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
  writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  writeFileSync(changelogPath, updated);

  console.log(`Bumped myCar from v${previous} to v${next}.`);
  console.log('The script does not commit, tag, or push. Review CHANGELOG.md, run checks, then release:');
  console.log(`  git add package.json package-lock.json CHANGELOG.md`);
  console.log(`  git commit -m "Release v${next}"`);
  console.log(`  git tag -a v${next} -m "myCar v${next}"`);
  console.log(`  git push origin main`);
  console.log(`  git push origin v${next}`);
}

if (command === 'check') check();
else if (['patch', 'minor', 'major'].includes(command)) bump(command);
else fail('Usage: node scripts/version.mjs check|patch|minor|major');
