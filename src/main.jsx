import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/manrope';
import './styles.css';
import App from './App';
import { applyTheme, readTheme } from './lib/theme';

applyTheme(readTheme());
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL }).catch(() => {
      // The app remains usable when a browser or embedded preview disallows service workers.
    });
  });
}
