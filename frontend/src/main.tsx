import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n/i18n';

createRoot(document.getElementById('root')!).render(
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full" /></div>}>
    <App />
  </Suspense>
);
