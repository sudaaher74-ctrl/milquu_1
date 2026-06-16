import React, { useEffect, Suspense } from 'react';
import { Outlet, useLocation, useNavigate, ScrollRestoration } from 'react-router-dom';
import { eventBus } from './utils/eventBus';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FloatingWhatsApp from './components/layout/FloatingWhatsApp';
import FloatingCartIsland from './components/layout/FloatingCartIsland';
import MobileNav from './components/layout/MobileNav';

// Loading Fallback Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-milquu-blue mb-4"></div>
      <p className="text-gray-500 font-medium">Loading Milquu Fresh...</p>
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
