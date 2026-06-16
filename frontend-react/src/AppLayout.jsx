import React, { useEffect, Suspense } from 'react';
import { Outlet, useLocation, useNavigate, ScrollRestoration } from 'react-router-dom';
import { eventBus } from './utils/eventBus';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FloatingWhatsApp from './components/layout/FloatingWhatsApp';
import FloatingCartIsland from './components/layout/FloatingCartIsland';
import MobileNav from './components/layout/MobileNav';
import { trackPageView } from './utils/analytics';

// Loading Fallback Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FDFBF7] to-white relative overflow-hidden">
    {/* Ambient Orbs */}
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[80px] bg-milquu-blue/10 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 translate-x-10 translate-y-10 w-[200px] h-[200px] rounded-full blur-[60px] bg-milquu-gold/20 animate-pulse" style={{ animationDelay: '1s' }}></div>
    </div>
    
    <div className="flex flex-col items-center relative z-10 bg-white/80 backdrop-blur-xl p-10 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 border-4 border-milquu-blue/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-milquu-blue rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-milquu-blue font-serif font-bold text-2xl">M</div>
      </div>
      <p className="text-gray-500 font-medium tracking-wide">Loading Milquu Fresh...</p>
    </div>
  </div>
);

// Error Boundary for ChunkLoadErrors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Caught error:", error, errorInfo);
    if (error.name === 'ChunkLoadError' || error.message.includes('Failed to fetch dynamically imported module')) {
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col px-4 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6 max-w-md">We encountered an unexpected error loading this page. Please refresh to try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-milquu-blue text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');
  const isDelivery = location.pathname.startsWith('/delivery');
  const isChatbot = location.pathname.startsWith('/chatbot');
  const isCampaign = location.pathname === '/free-sample';
  const hideLayout = isAdmin || isDelivery || isChatbot || isCampaign;

  useEffect(() => {
    const handleUnauthorized = () => {
      if (location.pathname.startsWith('/chatbot')) {
        navigate('/chatbot/login');
      } else if (location.pathname.startsWith('/delivery')) {
        navigate('/delivery/login');
      } else if (location.pathname.startsWith('/admin')) {
        navigate('/admin/login');
      } else {
        navigate('/login');
      }
    };

    const unsubscribe = eventBus.on('UNAUTHORIZED', handleUnauthorized);
    return () => unsubscribe();
  }, [location.pathname, navigate]);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return (
    <div className="font-sans">
      <ScrollRestoration />
      {!hideLayout && <Navbar />}
      
      <div className={!hideLayout ? "pb-[90px] md:pb-0" : ""}>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </div>

      {!hideLayout && <MobileNav />}
      {!hideLayout && <FloatingCartIsland />}
      {!hideLayout && <FloatingWhatsApp />}
      {!hideLayout && <Footer />}
    </div>
  );
}
