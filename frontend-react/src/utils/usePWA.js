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

/**
 * Hook to track the offline sync queue and trigger replays.
 *
 * @param {import('axios').AxiosInstance} axiosInstance - the configured Axios instance
 * @param {boolean} isOnline - current connectivity state
 * @returns {{ pendingCount: number, isSyncing: boolean, triggerSync: () => Promise<void>, lastSyncResult: object|null }}
 */
export function useSyncQueue(axiosInstance, isOnline) {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  // Listen for queue count changes
  useEffect(() => {
    // Lazy import to avoid circular dependency issues and keep the module
    // tree-shakeable for non-admin pages
    import('./offlineQueue.js').then(({ count }) => {
      count().then(setPendingCount).catch(() => {});
    });

    const unsub = eventBus.on('SYNC_QUEUE_CHANGE', ({ count }) => {
      setPendingCount(count);
    });
    return unsub;
  }, []);

  // Auto-sync when coming back online and there are pending items
  const triggerSync = useCallback(async () => {
    if (isSyncing || !isOnline) return;
    setIsSyncing(true);
    try {
      const { replayAll } = await import('./offlineQueue.js');
      const result = await replayAll(axiosInstance);
      setLastSyncResult(result);
    } catch (err) {
      console.error('[Sync] replay failed', err);
    } finally {
      setIsSyncing(false);
    }
  }, [axiosInstance, isOnline, isSyncing]);

  // Auto-trigger sync when going online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      triggerSync();
    }
  }, [isOnline, pendingCount, isSyncing, triggerSync]);

  return { pendingCount, isSyncing, triggerSync, lastSyncResult };
}
