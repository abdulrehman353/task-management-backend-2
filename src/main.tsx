import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
// @ts-ignore
import { registerSW } from 'virtual:pwa-register';

// Service Worker activate for PWA offline caching & auto-updates
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);