import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const steps = [
  {
    id: 1,
    title: 'Ethical Farming',
    desc: 'Our process begins at pristine, open-pasture farms. Our cows are grass-fed and nurtured with love, because happy cows produce the purest, most nutritious milk.',
    image: '/img/process1.png',
  },
  {
    id: 2,
    title: 'Automated Milking',
    desc: '100% untouched by human hands. We use state-of-the-art automated milking parlors to ensure maximum hygiene, speed, and zero contamination.',
    image: '/img/process2.png',
  },
  {
    id: 3,
    title: 'Purity Testing',
    desc: 'Every single batch undergoes stringent quality checks in our certified labs to guarantee zero adulteration, zero antibiotics, and zero hormones.',
    image: '/img/process3.png',
  },
  {
    id: 4,
    title: 'Fresh Packaging',
    desc: 'Milk is instantly chilled to 4°C to retain its natural goodness and then packaged in premium, sanitized, eco-friendly containers.',
    image: '/img/process4.png',
  },
  {
    id: 5,
    title: 'Farm to Doorstep',
    desc: 'Our dedicated cold-chain delivery network ensures that farm-fresh milk reaches your doorstep every morning before you even wake up.',
    image: '/img/process5.png',
  },
];

const Process = () => {
  const containerRef = useRef(null);
  
  // Track scroll progress within the container for the central line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  // Transform scroll progress to line height (0% to 100%)
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="process" className="py-24 bg-white relative overflow-hidden" ref={containerRef}>
      
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-milquu-green/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-milquu-gold/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif font-bold text-milquu-dark mb-4"
          >
            The <span className="text-milquu-gold italic">Journey</span> of Purity
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-500 font-sans max-w-2xl mx-auto"
          >
            A transparent roadmap from our lush green farms directly to your family's table.
          </motion.p>
        </div>

        {/* Roadmap Container */}
        <div className="relative">
          
          {/* Static Background Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gray-100 transform -translate-x-1/2 rounded-full"></div>
          
          {/* Animated Progress Line */}
          <motion.div 
            className="absolute left-1/2 top-0 w-[3px] bg-gradient-to-b from-milquu-gold to-milquu-green transform -translate-x-1/2 rounded-full origin-top"
            style={{ height: lineHeight }}
          ></motion.div>

          {/* Steps */}
          <div className="space-y-16 sm:space-y-24 md:space-y-32 relative">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              
              return (
                <div key={step.id} className={`flex flex-row items-center justify-between w-full relative ${isEven ? '' : 'flex-row-reverse'}`}>
                  
                  {/* Left or Right Content (Text) */}
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`flex w-[45%] flex-col justify-center relative ${isEven ? 'items-end text-right pr-4 md:pr-8 lg:pr-16' : 'items-start text-left pl-4 md:pl-8 lg:pl-16'}`}
                  >
                    <span className={`text-milquu-gold/10 font-serif text-5xl md:text-8xl lg:text-9xl font-black absolute top-1/2 -translate-y-1/2 -z-10 select-none ${isEven ? 'right-0' : 'left-0'}`}>
                      0{step.id}
                    </span>
                    <div className="relative z-10 w-full max-w-md">
                      <h3 className="text-sm sm:text-xl md:text-2xl lg:text-3xl font-serif font-bold text-milquu-dark mb-1 md:mb-4 leading-tight">
                        {step.title}
                      </h3>
                      <p className="text-gray-500 font-sans text-[9px] sm:text-sm md:text-base leading-tight sm:leading-snug md:leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>
                  
                  {/* Center Node (Dot) */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center z-20">
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true, margin: "-20px" }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      className="w-4 h-4 md:w-8 md:h-8 rounded-full bg-white border-2 md:border-4 border-milquu-gold shadow-lg flex items-center justify-center"
                    >
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-milquu-green"></div>
                    </motion.div>
                  </div>

                  {/* Image Content */}
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? 30 : -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`w-[45%] flex flex-col justify-center ${isEven ? 'items-start pl-4 md:pl-8 lg:pl-16' : 'items-end pr-4 md:pr-8 lg:pr-16'}`}
                  >
                    {/* Floating Image */}
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
                      className="relative w-full max-w-[100px] sm:max-w-[200px] md:max-w-[400px] lg:max-w-[500px] h-auto my-2 md:my-4"
                    >
                      <img 
                        src={step.image} 
                        alt={step.title} 
                        className="w-full h-auto object-contain drop-shadow-lg md:drop-shadow-2xl" 
                      />
                    </motion.div>
                  </motion.div>
                  
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Process;
