import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflineFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] to-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 fixed">
        <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] rounded-full blur-[100px] bg-milquu-blue/5 opacity-60"></div>
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] rounded-full blur-[120px] bg-milquu-gold/10 opacity-50"></div>
      </div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-2xl p-10 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 text-center relative z-10">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff size={40} className="text-gray-400" />
        </div>
        
        <h1 className="text-3xl font-serif font-bold text-milquu-dark mb-4">You're Offline</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          It looks like you've lost your internet connection. Please check your network and try again.
        </p>
        
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-milquu-blue text-white py-4 px-6 rounded-2xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw size={20} />
          Retry Connection
        </button>
      </div>
    </div>
  );
}
