export const THEME_KEY = 'mycar-theme';
export function readTheme() { try { const value = localStorage.getItem(THEME_KEY); return ['light','dark','system'].includes(value) ? value : 'system'; } catch { return 'system'; } }
export function resolveTheme(value) { return value === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : value; }
export function applyTheme(value) { document.documentElement.dataset.theme = resolveTheme(value); document.querySelector('meta[name="theme-color"]')?.setAttribute('content', value === 'dark' ? '#14251e' : '#f6f8f5'); }
export function setTheme(value) { if (!['light','dark','system'].includes(value)) return; try { localStorage.setItem(THEME_KEY, value); } catch {} applyTheme(value); window.dispatchEvent(new Event('mycar-theme-change')); }
