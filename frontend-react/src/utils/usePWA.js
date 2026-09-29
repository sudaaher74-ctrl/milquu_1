import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to manage the PWA "Add to Home Screen" install prompt.
 *
 * Chrome (and Chromium-based browsers) fire `beforeinstallprompt` when the app
 * meets PWA install criteria. We capture that event so we can trigger the native
 * install dialog from our own UI button.
 *
 * @returns {{ canInstall: boolean, isInstalled: boolean, promptInstall: () => void }}
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e) => {
      // Prevent the browser's default mini-infobar
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  return {
    canInstall: !!deferredPrompt && !isInstalled,
    isInstalled,
    promptInstall,
  };
}

/**
 * Hook to track the browser's online/offline status in real time.
 *
 * @returns {{ isOnline: boolean, wasOffline: boolean }}
 *   - isOnline: current connectivity state
 *   - wasOffline: true briefly after coming back online (for "reconnected" toast)
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      // Clear the "was offline" flag after 4 seconds so the reconnect toast fades
      setTimeout(() => setWasOffline(false), 4000);
    };
    const goOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}
