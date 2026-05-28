import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import CategoryListing from './pages/CategoryListing';

// Helper to scroll to top on navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <Navbar />
      <ScrollToTop />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryId" element={<CategoryListing />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
