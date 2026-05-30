import React from 'react';
import Hero from '../components/home/Hero';
import About from '../components/home/About';
import Products from '../components/home/Products';
import Process from '../components/home/Process';
import Reviews from '../components/home/Reviews';
import SEOHead from '../components/seo/SEOHead';
import { LocalBusinessSchema, buildBreadcrumbSchema, commonFAQs } from '../data/schemas';

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
      <Hero />
      <Products />
      <About />
      <Process />
      <Reviews />
    </>
  );
};

export default Home;
