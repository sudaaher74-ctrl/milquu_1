import React from 'react';
import Hero from '../components/home/Hero';
import About from '../components/home/About';
import Products from '../components/home/Products';
import Process from '../components/home/Process';

const Home = () => {
  return (
    <>
      <Hero />
      <Products />
      <About />
      <Process />
    </>
  );
};

export default Home;
