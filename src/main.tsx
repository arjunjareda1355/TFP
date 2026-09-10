import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ClerkAuthProvider } from './components/auth/ClerkAuthProvider';
import { ToastProvider } from './context/ToastContext';
import './index.css';

// Guard against third-party network blocking or timeouts for Clerk JS
if (typeof window !== 'undefined') {
  const isClerkLoadIssue = (reasonOrError: any, message?: string): boolean => {
    const msg = (message || (reasonOrError && (reasonOrError.message || String(reasonOrError)))) || '';
    const code = reasonOrError && typeof reasonOrError === 'object' ? (reasonOrError as any).code : '';
    return (
      code === 'failed_to_load_clerk_js_timeout' ||
      msg.includes('failed_to_load_clerk_js') ||
      msg.includes('Failed to load Clerk') ||
      msg.includes('clerk.browser.js') ||
      msg.includes('clerk.accounts.dev')
    );
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (isClerkLoadIssue(event.reason)) {
      event.preventDefault();
      console.warn('[Clerk] Handled timeout gracefully. Continuing in standard editorial mode.');
    }
  });

  window.addEventListener('error', (event) => {
    if (isClerkLoadIssue(event.error, event.message)) {
      event.preventDefault();
      console.warn('[Clerk] Handled load error gracefully.');
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkAuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ClerkAuthProvider>
  </StrictMode>,
);
