import { test, expect } from '@playwright/test';

// Contract tests only: all Supabase traffic is intercepted. No real project,
// mailbox, credentials, or live authentication service is used by these tests.
const AUTH_APP = 'http://127.0.0.1:5174';
const API = 'https://mycar-test.supabase.co';
const USER_ID = '33333333-3333-4333-8333-333333333333';
const token = role => `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ role, sub: USER_ID, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.test-signature`;
const user = { id: USER_ID, aud: 'authenticated', role: 'authenticated', email: 'driver@example.com', app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: { full_name: 'Test Driver' }, created_at: '2026-01-01T00:00:00Z', identities: [] };
const session = () => ({ access_token: token('authenticated'), refresh_token: 'fictional-refresh-token', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user });
const profile = { id: USER_ID, full_name: 'Test Driver', phone: '', city: '', bio: '', currency: 'INR', distance_unit: 'km', monthly_budget_paise: 0, reminders_enabled: true, reminder_days: 30, theme: 'light' };

async function mockBackend(page, captured) {
  await page.route(`${API}/**`, async route => {
    const request = route.request(); const url = new URL(request.url());
    const body = request.postDataJSON() || {};
    captured.push({ path: url.pathname, query: url.searchParams.toString(), method: request.method(), body, redirect: url.searchParams.get('redirect_to') });
    const json = data => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
    if (url.pathname.startsWith('/rest/v1/profiles')) return json(profile);
    if (url.pathname.startsWith('/rest/v1/')) return json([]);
    if (url.pathname === '/auth/v1/token') return json(session());
    if (url.pathname === '/auth/v1/signup') return json({ ...user, identities: [] });
    if (url.pathname === '/auth/v1/recover') return json({});
    if (url.pathname === '/auth/v1/user') return json(user);
    if (url.pathname === '/auth/v1/logout') return route.fulfill({ status: 204 });
    return json({});
  });
}

test('configured sign-in uses Supabase and loads only the account workspace', async ({ page }) => {
  const captured = []; const errors = []; page.on('pageerror', e => errors.push(e.message));
  await mockBackend(page, captured); await page.goto(`${AUTH_APP}/#/login`);
  await page.getByLabel('Email address').fill('driver@example.com');
  await page.getByLabel('Password', { exact: false }).first().fill('a-test-password');
  await page.getByRole('button', { name: 'Sign in to myCar' }).click();
  await expect(page.getByRole('heading', { name: 'Your garage, at a glance.' })).toBeVisible();
  await expect(page.locator('.demo-banner')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Your garage is waiting.' })).toBeVisible();
  const login = captured.find(r => r.path === '/auth/v1/token');
  expect(login.body).toMatchObject({ email: 'driver@example.com', password: 'a-test-password' });
  const reads = captured.filter(r => r.path.startsWith('/rest/v1/'));
  expect([...new Set(reads.map(r => r.path.split('/').pop()))].sort()).toEqual(['expenses','profiles','vehicles']);
  expect(reads.filter(r => /vehicles|expenses/.test(r.path)).every(r => r.query.includes(`user_id=eq.${USER_ID}`))).toBeTruthy();
  expect(reads.find(r => r.path.endsWith('/profiles')).query).toContain(`id=eq.${USER_ID}`);
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
  expect(captured.find(r => r.path === '/auth/v1/logout')?.query).toContain('scope=local');
  expect(errors).toEqual([]);
});
test('signup sends display metadata and a base-path-aware confirmation redirect', async ({ page }) => {
  const captured = []; await mockBackend(page, captured); await page.goto(`${AUTH_APP}/#/signup`);
  await page.getByLabel('Full name').fill('New Driver');
  await page.getByLabel('Email address').fill('new@example.com');
  await page.getByLabel('Password', { exact: false }).first().fill('a-strong-test-password');
  await page.getByRole('button', { name: 'Create my account' }).click();
  await expect(page.getByRole('heading', { name: 'One little step to go.' })).toBeVisible();
  const signup = captured.find(r => r.path === '/auth/v1/signup');
  expect(signup.body.data).toEqual({ full_name: 'New Driver' });
  expect(signup.body.code_challenge).toBeTruthy();
  expect(signup.body.code_challenge_method).toBeTruthy();
  expect(signup.redirect).toBe(`${AUTH_APP}/#/login`);
  expect(signup.body.password).toBe('a-strong-test-password');
});
test('forgot password is neutral and reset updates an authenticated session', async ({ page }) => {
  const captured = []; await mockBackend(page, captured); await page.goto(`${AUTH_APP}/#/forgot-password`);
  await page.getByLabel('Email address').fill('unknown@example.com');
  await page.getByRole('button', { name: 'Send reset link' }).click();
  await expect(page.getByRole('heading', { name: 'A fresh start is in your inbox.' })).toBeVisible();
  const recover = captured.find(r => r.path === '/auth/v1/recover');
  expect(recover.redirect).toBe(`${AUTH_APP}/#/reset-password`);
  await expect(page.getByRole('button', { name: /Request another link in/ })).toBeDisabled();
  await page.evaluate(value => localStorage.setItem('sb-mycar-test-auth-token', JSON.stringify(value)), session());
  await page.goto(`${AUTH_APP}/#/reset-password`); await page.reload();
  await page.getByLabel('New password', { exact: false }).first().fill('a-new-strong-password');
  await page.getByLabel('Confirm new password').fill('a-new-strong-password');
  await page.getByRole('button', { name: 'Update password' }).click();
  await expect(page.getByRole('heading', { name: 'All set. Fresh start.' })).toBeVisible();
  expect(captured.find(r => r.path === '/auth/v1/user' && r.method === 'PUT').body.password).toBe('a-new-strong-password');
});
test('reset page does not allow a password change without a session', async ({ page }) => {
  await page.goto(`${AUTH_APP}/#/reset-password`);
  await expect(page.getByText('Your reset link is missing, expired, or already used.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Request a new link' })).toBeVisible();
});
