import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Hero from '../components/home/Hero';
import About from '../components/home/About';
import Products from '../components/home/Products';
import Process from '../components/home/Process';
import SEOHead from '../components/seo/SEOHead';
import { LocalBusinessSchema, buildBreadcrumbSchema } from '../data/schemas';
import MobileHome from '../components/home/MobileHome';

const Home = () => {
  const schema = [
    LocalBusinessSchema,
    buildBreadcrumbSchema([{ name: 'Home', url: '/' }])
  ];

  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
      return;
    }
    
    // Redirect to campaign page if they haven't claimed or skipped it
    const hasClaimed = localStorage.getItem('freeSampleClaimed');
    if (user && !hasClaimed) {
      navigate('/free-sample', { replace: true });
    }
  }, [navigate, user, loading]);

  return (
    <>
      <SEOHead 
        schema={schema}
      />
      <MobileHome />
      <div className="hidden md:block">
        <Hero />
        <Products />
        <About />
        <Process />
      </div>
    </>
  );
};

export default Home;
