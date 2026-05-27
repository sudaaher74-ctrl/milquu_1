import React from 'react';
import Navbar from './components/layout/Navbar';
import Hero from './components/home/Hero';
import About from './components/home/About';
import Products from './components/home/Products';
import Footer from './components/layout/Footer';

function App() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        <About />
        <Products />
      </main>

      <Footer />
    </div>
  );
}

export default App;
