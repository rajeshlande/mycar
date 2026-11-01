export function isPublicKey(value) {
  if (typeof value !== 'string' || !value || /\s/.test(value)) return false;
  if (value.startsWith('sb_secret_')) return false;
  if (value.startsWith('sb_publishable_')) return value.length > 20;
  try {
    const parts = value.split('.');
    if (parts.length !== 3) return false;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(json).role === 'anon';
  } catch { return false; }
}
export function isProjectUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash; }
  catch { return false; }
}
