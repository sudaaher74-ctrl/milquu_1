import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if already in standalone mode (installed)
    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true;
    
    setIsStandalone(checkStandalone);
    if (checkStandalone) return;

    // Check if user previously dismissed prompt in last 7 days
    const dismissedAt = localStorage.getItem('milquu_pwa_dismissed');
    if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/crios|fxios|chrome/.test(userAgent);
    if (isIosDevice && isSafari) {
      setIsIOS(true);
      const timer = setTimeout(() => setShowPrompt(true), 2500);
      return () => clearTimeout(timer);
    }

    // Standard Chromium beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('milquu_pwa_dismissed', String(Date.now()));
  };

  // Hide on internal staff and admin routes
  if (
    isStandalone ||
    !showPrompt ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/delivery') ||
    location.pathname.startsWith('/chatbot')
  ) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-96 z-[9999] pointer-events-auto"
      >
        <div className="bg-white/95 backdrop-blur-2xl border border-gray-100 shadow-[0_12px_40px_rgba(0,0,0,0.15)] rounded-2xl p-4 flex flex-col gap-3 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3 pr-6">
            <img 
              src="/pwa-192x192.png" 
              alt="MilQuu Fresh" 
              className="w-12 h-12 rounded-xl object-cover shadow-sm flex-shrink-0"
            />
            <div>
              <h4 className="font-serif font-bold text-sm text-milquu-dark leading-tight">
                Install MilQuu Fresh App
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                Fast daily milk tracking & instant morning delivery notifications.
              </p>
            </div>
          </div>

          {isIOS ? (
            <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-2.5 text-xs text-amber-900 font-medium flex items-center gap-2">
              <span className="text-base">📲</span>
              <span>
                Tap <Share size={13} className="inline mx-1 text-blue-600" /> in Safari, then select <strong>'Add to Home Screen'</strong> <PlusSquare size={13} className="inline mx-1" />
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-milquu-blue hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Download size={14} /> Install Now
              </button>
              <button
                onClick={handleDismiss}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 py-2.5 px-3 rounded-xl transition-colors"
              >
                Not Now
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
