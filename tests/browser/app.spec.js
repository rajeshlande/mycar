import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function enterSample(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore a sample workspace' }).click();
  await expect(page.getByRole('heading', { name: 'Your garage, at a glance.' })).toBeVisible();
}

test('unconfigured authentication is honest and setup is reachable', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/#/login');
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
  await page.getByLabel('Email address').fill('test@example.com');
  await page.getByLabel('Password', { exact: false }).first().fill('not-a-real-password');
  await page.getByRole('button', { name: 'Sign in to myCar' }).click();
  await expect(page.getByRole('alert')).toContainText('Supabase isn’t connected yet');
  await page.getByRole('link', { name: 'Setup guide' }).click();
  await expect(page.getByRole('heading', { name: 'Connect your Supabase project.' })).toBeVisible();
  expect(errors).toEqual([]);
});
test('sample dashboard, filters, expense create/edit/delete and CSV export', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await enterSample(page);
  await expect(page.locator('.demo-banner')).toContainText('Fictional data');
  await page.getByLabel('Filter dashboard by vehicle').selectOption('sample-nexon');
  await expect(page.locator('.vehicle-spotlight')).toContainText('Tata Nexon EV');
  await page.getByRole('button', { name: 'Add expense', exact: true }).first().click();
  await page.getByLabel('Amount in rupees').fill('123.45');
  await page.getByLabel('Description').fill('Test bridge toll');
  await page.getByRole('radio', { name: 'Tolls & FASTag' }).click();
  await page.getByRole('button', { name: 'Save expense', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('link', { name: 'Expenses', exact: true }).click();
  await page.getByLabel('Search expenses').fill('Test bridge toll');
  await expect(page.locator('.expense-table tbody tr')).toHaveCount(1);
  await expect(page.locator('.expense-table')).toContainText('₹123.45');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise; expect(download.suggestedFilename()).toMatch(/^mycar-expenses-.*\.csv$/);
  await page.getByRole('button', { name: 'Edit Test bridge toll' }).click();
  await page.getByLabel('Amount in rupees').fill('200');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.locator('.expense-table')).toContainText('₹200');
  await page.getByRole('button', { name: 'Delete Test bridge toll' }).click();
  await page.getByRole('button', { name: 'Delete expense', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Nothing on this stretch of road.' })).toBeVisible();
  expect(errors).toEqual([]);
});
test('vehicle create, edit, care details and cascade confirmation', async ({ page }) => {
  await enterSample(page);
  await page.getByRole('link', { name: /My vehicles/ }).click();
  await page.getByRole('button', { name: 'Add vehicle', exact: true }).click();
  await page.getByLabel('Vehicle nickname').fill('Weekend Polo');
  await page.getByLabel('Make', { exact: true }).fill('Volkswagen');
  await page.getByLabel('Model', { exact: true }).fill('Polo');
  await page.getByLabel('Registration number').fill('MH 12 ZZ 9999');
  await page.getByLabel('Current odometer').fill('15000');
  await page.getByRole('button', { name: 'Add vehicle', exact: true }).last().click();
  await expect(page.getByRole('heading', { name: 'Weekend Polo' })).toBeVisible();
  await page.getByRole('link', { name: 'View vehicle details' }).filter({ has: page.locator(':scope') }).last().click();
  await expect(page.getByRole('heading', { name: 'Weekend Polo', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Delete vehicle', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('0 expenses');
  await page.getByRole('button', { name: 'Delete vehicle & expenses' }).click();
  await expect(page.getByRole('heading', { name: 'This vehicle isn’t in your garage.' })).toBeVisible();
});
test('profile, budget, distance preference and theme persist in preview', async ({ page }) => {
  await enterSample(page);
  await page.getByRole('link', { name: 'Profile', exact: true }).click();
  await page.getByLabel('Full name').fill('Taylor Driver');
  await page.getByLabel('City', { exact: true }).fill('Mumbai');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.locator('.profile-summary')).toContainText('Taylor Driver');
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await page.getByLabel('Monthly budget in rupees').fill('45000');
  await page.getByRole('combobox', { name: 'Distance unit', exact: true }).selectOption('mi');
  await page.getByRole('button', { name: 'Save preferences' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Sample preferences updated.' })).toBeVisible();
  await page.getByRole('radio', { name: 'Dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await expect(page.locator('.budget-panel')).toContainText('₹45,000');
});
test('mobile navigation and all pages fit the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterSample(page);
  for (const name of ['Expenses', 'My vehicles', 'Profile', 'Settings', 'Dashboard']) {
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('link', { name: new RegExp(`^${name}`) }).click();
    await expect(page.locator('.sidebar')).not.toHaveClass(/open/);
    const width = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
    expect(width.document, `${name} should not overflow horizontally`).toBeLessThanOrEqual(width.viewport);
  }
  await page.getByRole('button', { name: 'Add expense', exact: true }).last().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Close dialog' }).click();
});
test('offline shell is cached without caching API data', async ({ page, context }) => {
  await enterSample(page);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const keys = await page.evaluate(() => caches.keys());
  expect(keys.some(k => k.startsWith('mycar:'))).toBeTruthy();
  const entries = await page.evaluate(async () => { const key = (await caches.keys()).find(k => k.startsWith('mycar:')); return (await (await caches.open(key)).keys()).map(r => r.url); });
  expect(entries.every(url => !url.includes('/auth/v1/') && !url.includes('/rest/v1/'))).toBeTruthy();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
  await context.setOffline(false);
});

test('main screens and dialogs pass automated WCAG A/AA checks in both themes', async ({ page }) => {
  test.setTimeout(60000);
  await enterSample(page);
  const scan = async label => {
    await page.waitForTimeout(250);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), label).toEqual([]);
  };
  for (const route of ['dashboard', 'expenses', 'vehicles', 'vehicles/sample-creta', 'profile', 'settings']) {
    await page.goto(`/#/${route}`); await scan(`light ${route}`);
  }
  await page.goto('/#/dashboard'); await page.waitForTimeout(250);
  await page.getByRole('button', { name: 'Add expense', exact: true }).first().click(); await scan('expense dialog');
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.goto('/#/settings'); await page.waitForTimeout(250);
  await page.getByRole('radio', { name: 'Dark', exact: true }).click();
  for (const route of ['dashboard', 'expenses', 'vehicles', 'profile', 'settings']) {
    await page.goto(`/#/${route}`); await scan(`dark ${route}`);
  }
});
