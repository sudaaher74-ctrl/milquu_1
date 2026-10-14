import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Hero from '../components/home/Hero';
import About from '../components/home/About';
import Products from '../components/home/Products';
import Process from '../components/home/Process';
import SEOHead from '../components/seo/SEOHead';
import { isCrawler } from '../utils/seo';
import MobileHome from '../components/home/MobileHome';

const Home = () => {
  const crawler = isCrawler();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Redirect signed-in users to campaign page if they haven't claimed or skipped it
    const hasClaimed = localStorage.getItem('freeSampleClaimed');
    if (!loading && user && !hasClaimed) {
      navigate('/free-sample', { replace: true });
    }
  }, [navigate, user, loading]);

  return (
    <>
      <SEOHead path="/" />
      {/* Crawlers get the full marketing page at every viewport (the phone layout
          hides it and, in the browser, redirects to the logged-in app). */}
      {!crawler && <MobileHome />}
      <div className={crawler ? 'block' : 'hidden md:block'}>
        <Hero />
        <Products />
        <About />
        <Process />
      </div>
    </>
  );
};

export default Home;
