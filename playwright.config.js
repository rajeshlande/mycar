import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  retries: process.env.CI ? 2 : 0,
  expect: { timeout: 7000 },
  use: { baseURL: 'http://127.0.0.1:4173', viewport: { width: 1440, height: 1000 }, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: [
    { command: 'npm run preview', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI, timeout: 30000 },
    {
      command: 'npm run dev -- --port 5174 --strictPort',
      env: {
        VITE_SUPABASE_URL: 'https://mycar-test.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'sb_publishable_browser_test_key_not_a_real_key',
      },
      url: 'http://127.0.0.1:5174',
      reuseExistingServer: false,
      timeout: 30000,
    },
    {
      // Guaranteed-unconfigured server. The production preview on 4173 reflects
      // whatever VITE_SUPABASE_* values the build received, so it cannot be used
      // to assert setup-mode behaviour once repository secrets exist. Blanking
      // the variables here also overrides a developer's local .env.local,
      // because Vite's loadEnv gives process.env the final word.
      command: 'npm run dev -- --port 5175 --strictPort',
      env: { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' },
      url: 'http://127.0.0.1:5175',
      reuseExistingServer: false,
      timeout: 30000,
    },
  ],
  reporter: [['list']],
});
