import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { router } from './router.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import * as Sentry from '@sentry/react'
import './i18n'
import { initGA } from './utils/analytics'
import { GoogleOAuthProvider } from '@react-oauth/google'

initGA();

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ['localhost', /^https:\/\/milquu-backend\.onrender\.com\/api/],
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
}

import { registerSW } from 'virtual:pwa-register'

// Register PWA service worker with auto-update and offline capability
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] New version detected, updating cache in background...');
  },
  onOfflineReady() {
    console.log('[PWA] MilQuu is ready for offline usage.');
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || '493263183371-900jeus48uso6k3fs997one5diooao35.apps.googleusercontent.com'}>
        <AuthProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </AuthProvider>
      </GoogleOAuthProvider>
    </HelmetProvider>
  </StrictMode>,
)
