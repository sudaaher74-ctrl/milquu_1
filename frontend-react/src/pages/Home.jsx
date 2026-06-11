import React from 'react';
import Hero from '../components/home/Hero';
import About from '../components/home/About';
import Products from '../components/home/Products';
import Process from '../components/home/Process';
import Reviews from '../components/home/Reviews';
import SEOHead from '../components/seo/SEOHead';
import { LocalBusinessSchema, buildBreadcrumbSchema } from '../data/schemas';
import MobileHome from '../components/home/MobileHome';

const Home = () => {
  const schema = [
    LocalBusinessSchema,
    buildBreadcrumbSchema([{ name: 'Home', url: '/' }])
  ];

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
        <Reviews />
      </div>
    </>
  );
};

export default Home;
