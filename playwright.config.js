import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  expect: { timeout: 7000 },
  use: { baseURL: 'http://127.0.0.1:4173', viewport: { width: 1440, height: 1000 }, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: [
    { command: 'npm run preview', url: 'http://127.0.0.1:4173', reuseExistingServer: true, timeout: 30000 },
    { command: 'VITE_SUPABASE_URL=https://mycar-test.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_browser_test_key_not_a_real_key npm run dev -- --port 5174', url: 'http://127.0.0.1:5174', reuseExistingServer: true, timeout: 30000 },
  ],
  reporter: [['list']],
});
