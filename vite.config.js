import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { isPublicKey, isProjectUrl } from './src/lib/public-config.mjs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  if (env.VITE_SUPABASE_URL && !isProjectUrl(env.VITE_SUPABASE_URL)) throw new Error('VITE_SUPABASE_URL must be an HTTPS project URL without credentials, query, or fragment.');
  if (env.VITE_SUPABASE_ANON_KEY && !isPublicKey(env.VITE_SUPABASE_ANON_KEY)) throw new Error('Refusing to bundle a privileged or invalid key. Use a publishable/anon public key only.');
  return {
    base: './',
    plugins: [react(), {
      name: 'mycar-static-offline-cache',
      apply: 'build',
      writeBundle(options, bundle) {
        const dir = options.dir || resolve('dist');
        const publicFiles = ['manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'images/suv-forest.webp'];
        const paths = ['./', ...publicFiles, ...Object.keys(bundle).filter(path => path !== 'index.html' && path !== 'sw.js' && path !== 'precache.json')];
        writeFileSync(resolve(dir, 'precache.json'), JSON.stringify(paths));
        const workerPath = resolve(dir, 'sw.js');
        const hash = createHash('sha256').update(Object.keys(bundle).sort().join('|'));
        for (const file of ['sw.js', ...publicFiles]) hash.update(readFileSync(resolve(dir, file)));
        const version = hash.digest('hex').slice(0, 12);
        writeFileSync(workerPath, readFileSync(workerPath, 'utf8').replace('__BUILD_ID__', version));
      },
    }],
    server: { host: '0.0.0.0', port: 5173, strictPort: true, allowedHosts: true },
    preview: { host: '0.0.0.0', port: 4173, strictPort: true, allowedHosts: true },
    build: { chunkSizeWarningLimit: 700 },
  };
});
