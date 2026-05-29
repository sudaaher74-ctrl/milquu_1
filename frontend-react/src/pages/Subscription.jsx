import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, CalendarDays, Milk, Clock } from 'lucide-react';

const products = [
  { id: 'a2', name: 'A2 Cow Milk', price: '₹95/L', image: '/img/A2milk.png' },
  { id: 'buffalo', name: 'Premium Buffalo Milk', price: '₹105/L', image: '/img/buffalomilk.png' },
  { id: 'cow', name: 'Pure Cow Milk', price: '₹85/L', image: '/img/cowmilk.png' },
];

const frequencies = [
  { id: 'daily', name: 'Daily Delivery', desc: 'Every morning' },
  { id: 'alt', name: 'Alternate Days', desc: 'Mon, Wed, Fri' },
  { id: 'weekly', name: 'Once a Week', desc: 'Every Sunday' },
];

const timeSlots = [
  { id: 'morning', name: 'Morning', desc: '5:00 AM - 8:00 AM' },
  { id: 'evening', name: 'Evening', desc: '5:00 PM - 8:00 PM' },
];

const Subscription = () => {
  const [selectedProduct, setSelectedProduct] = useState('a2');
  const [selectedFreq, setSelectedFreq] = useState('daily');
  const [selectedTime, setSelectedTime] = useState('morning');
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', city: '', pincode: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedProdDetails = products.find(p => p.id === selectedProduct);
      const priceNum = parseFloat(selectedProdDetails.price.replace(/[^0-9.-]+/g,""));
      
      const orderData = {
        name: formData.name,
        phone: formData.phone,
        deliveryAddress: `${formData.address}, ${formData.city}, ${formData.pincode}`,
        frequency: selectedFreq === 'daily' ? 'Daily' : selectedFreq === 'alt' ? 'Alternate Days' : 'Weekly',
        totalAmount: priceNum * 30, // Estimating 30 days
        items: []
      };

      const res = await fetch('https://milquu-backend.onrender.com/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        alert("Subscription created successfully!");
        setFormData({ name: '', phone: '', address: '', city: '', pincode: '' });
      } else {
        alert("Failed to submit subscription.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting subscription.");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] to-white pt-32 pb-24 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[60vh] pointer-events-none bg-milquu-green/5 rounded-b-[120px]"></div>
      <div className="absolute top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] bg-milquu-green/20 opacity-30 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-20 -right-40 w-[600px] h-[600px] rounded-full blur-[120px] bg-milquu-gold/20 opacity-40 mix-blend-multiply pointer-events-none"></div>

      {/* Floating Blurred Product Backgrounds */}
      <motion.div 
        animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-24 lg:top-40 -left-6 lg:left-32 w-[90px] sm:w-[120px] lg:w-[180px] opacity-60 lg:opacity-100 drop-shadow-2xl pointer-events-none z-0"
      >
        <img src="/img/cowmilk.png" alt="Cow Milk Background" className="w-full h-auto object-contain" />
      </motion.div>

      <motion.div 
        animate={{ y: [0, 40, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-60 lg:bottom-60 -right-8 lg:right-20 w-[100px] sm:w-[140px] lg:w-[200px] opacity-60 lg:opacity-100 drop-shadow-2xl pointer-events-none z-0"
      >
        <img src="/img/buffalomilk.png" alt="Buffalo Milk Background" className="w-full h-auto object-contain" />
      </motion.div>

      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute top-48 lg:top-60 right-0 lg:right-40 w-[80px] sm:w-[120px] lg:w-[160px] opacity-60 lg:opacity-100 drop-shadow-2xl pointer-events-none z-0"
      >
        <img src="/img/A2milk.png" alt="A2 Milk Background" className="w-full h-auto object-contain" />
      </motion.div>

      <div className="max-w-4xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="text-milquu-green font-sans font-semibold tracking-widest uppercase text-sm mb-4 block">
              Farm to Home
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-milquu-dark mb-6 leading-tight">
              Subscribe to Freshness
            </h1>
            <p className="text-lg text-gray-500 font-sans leading-relaxed max-w-2xl mx-auto">
              Set up your recurring delivery in three simple steps. Enjoy pure, farm-fresh milk delivered to your doorstep without the hassle of ordering daily.
            </p>
          </motion.div>
        </div>

        {/* Subscription Form Wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="bg-white/80 backdrop-blur-2xl rounded-[40px] p-8 md:p-12 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-milquu-gold/10 to-transparent opacity-50 rounded-bl-[150px] pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
            
            {/* Step 1: Product Selection */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-milquu-gold/10 flex items-center justify-center text-milquu-gold">
                  <Milk size={20} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-milquu-dark">Step 1: Choose Your Milk</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {products.map(product => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => setSelectedProduct(product.id)}
                    className={`relative p-2 sm:p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center ${
                      selectedProduct === product.id 
                      ? 'border-milquu-gold bg-[#FFFDF9] shadow-md scale-[1.02]' 
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {selectedProduct === product.id && (
                      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 text-milquu-gold z-10">
                        <CheckCircle2 size={16} className="sm:w-5 sm:h-5" />
                      </div>
                    )}
                    <div className="h-16 sm:h-24 w-full flex items-center justify-center mb-2 sm:mb-4">
                      <img src={product.image} alt={product.name} className="h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="font-sans font-bold text-[10px] sm:text-base text-milquu-dark mb-0.5 sm:mb-1 leading-tight">{product.name}</span>
                    <span className="text-[9px] sm:text-sm font-sans font-medium text-gray-500">{product.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Frequency Selection */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-milquu-green/10 flex items-center justify-center text-milquu-green">
                  <CalendarDays size={20} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-milquu-dark">Step 2: Choose Frequency</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {frequencies.map(freq => (
                  <button
                    key={freq.id}
                    type="button"
                    onClick={() => setSelectedFreq(freq.id)}
                    className={`relative p-2 sm:p-5 rounded-2xl border-2 transition-all duration-300 text-center sm:text-left ${
                      selectedFreq === freq.id 
                      ? 'border-milquu-green bg-[#F7FCF8] shadow-md scale-[1.02]' 
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {selectedFreq === freq.id && (
                      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 text-milquu-green">
                        <CheckCircle2 size={16} className="sm:w-5 sm:h-5" />
                      </div>
                    )}
                    <span className="block font-sans font-bold text-[10px] sm:text-base text-milquu-dark mb-0.5 sm:mb-1">{freq.name}</span>
                    <span className="block text-[9px] sm:text-sm font-sans font-medium text-gray-500 leading-tight sm:leading-normal">{freq.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Time Selection */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-milquu-gold/10 flex items-center justify-center text-milquu-gold">
                  <Clock size={20} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-milquu-dark">Step 3: Preferred Time</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                {timeSlots.map(time => (
                  <button
                    key={time.id}
                    type="button"
                    onClick={() => setSelectedTime(time.id)}
                    className={`relative p-3 sm:p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left ${
                      selectedTime === time.id 
                      ? 'border-milquu-gold bg-[#FFFDF9] shadow-md scale-[1.02]' 
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center sm:text-left mb-2 sm:mb-0">
                      <span className="block font-sans font-bold text-[11px] sm:text-base text-milquu-dark mb-0.5 sm:mb-1">{time.name}</span>
                      <span className="block text-[10px] sm:text-sm font-sans font-medium text-gray-500 leading-tight sm:leading-normal">{time.desc}</span>
                    </div>
                    {selectedTime === time.id && (
                      <div className="text-milquu-gold">
                        <CheckCircle2 size={18} className="sm:w-6 sm:h-6" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Step 4: Delivery Details */}
            <div>
              <h3 className="text-2xl font-serif font-bold text-milquu-dark mb-6">Delivery Details</h3>
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-sans font-semibold text-gray-700 mb-2">Full Name</label>
                    <input 
                      required
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Jane Doe"
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-milquu-gold focus:ring-2 focus:ring-milquu-gold/20 transition-all font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input 
                      required
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-milquu-gold focus:ring-2 focus:ring-milquu-gold/20 transition-all font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-sans font-semibold text-gray-700 mb-2">Complete Delivery Address</label>
                  <textarea 
                    required
                    rows="3" 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Apartment, Society, Street..."
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-milquu-gold focus:ring-2 focus:ring-milquu-gold/20 transition-all font-sans resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-sans font-semibold text-gray-700 mb-2">City</label>
                    <select 
                      required
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-milquu-gold focus:ring-2 focus:ring-milquu-gold/20 transition-all font-sans appearance-none text-gray-700"
                    >
                      <option value="" disabled>Select Delivery Area</option>
                      <option value="Panvel">Panvel</option>
                      <option value="New Panvel">New Panvel</option>
                      <option value="Khanda Colony">Khanda Colony</option>
                      <option value="Kamothe">Kamothe</option>
                      <option value="Karanjade">Karanjade</option>
                      <option value="Kharghar">Kharghar</option>
                      <option value="Belapur">Belapur</option>
                      <option value="Nerul">Nerul</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-semibold text-gray-700 mb-2">Pincode</label>
                    <input 
                      required
                      type="text" 
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="e.g., 400001"
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-milquu-gold focus:ring-2 focus:ring-milquu-gold/20 transition-all font-sans"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button 
                type="submit" 
                className="w-full relative group/btn overflow-hidden rounded-full p-[1px]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-milquu-cream via-milquu-gold/40 to-milquu-cream rounded-full opacity-80 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                <div className="relative bg-gradient-to-r from-[#FFFDF9] to-[#FFF8ED] px-8 py-5 rounded-full flex items-center justify-center space-x-2 transition-all duration-300 group-hover/btn:bg-opacity-0 group-hover/btn:shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                  <span className="font-sans font-bold text-milquu-dark uppercase tracking-wide text-base">
                    Start Subscription
                  </span>
                  <ArrowRight size={20} className="text-milquu-gold ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

          </form>
        </motion.div>

      </div>
    </div>
  );
};

export default Subscription;
