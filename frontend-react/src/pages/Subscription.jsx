import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, CalendarDays, Milk, Clock } from 'lucide-react';

const products = [
  { id: 'a2', name: 'A2 Cow Milk', basePrice: 95, image: '/img/A2milk.webp' },
  { id: 'buffalo', name: 'Premium Buffalo Milk', basePrice: 105, image: '/img/buffalomilk.webp' },
  { id: 'cow', name: 'Pure Cow Milk', basePrice: 85, image: '/img/cowmilk.webp' },
  { id: 'cow-pouch', name: 'Cow Milk (Pouch)', basePrice: 58, image: '/img/cow-milk-pouch.webp' },
  { id: 'buffalo-pouch', name: 'Buffalo Milk (Pouch)', basePrice: 75, image: '/img/buffalo-milk-pouch.webp' },
];

const frequencies = [
  { id: 'daily', name: 'Daily Delivery', desc: 'Every morning' },
  { id: 'alt', name: 'Alternate Days', desc: 'Mon, Wed, Fri' },
  { id: 'weekly', name: 'Once a Week', desc: 'Every Sunday' },
];

// timeSlots removed as delivery is only in the morning

const Subscription = () => {
  const [selectedProduct, setSelectedProduct] = useState('a2');
  const [selectedUnit, setSelectedUnit] = useState('1 Litre');
  const [selectedFreq, setSelectedFreq] = useState('daily');
  const [selectedTime, setSelectedTime] = useState('morning');
  const [paymentMethod, setPaymentMethod] = useState('PHONEPE');
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', city: '', pincode: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadScript = (src) => {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const saveSubscription = async (paymentId, method, isPaid = false) => {
    try {
      const selectedProdDetails = products.find(p => p.id === selectedProduct);
      const priceNum = selectedUnit === '500 ml' ? Math.ceil(selectedProdDetails.basePrice / 2) : selectedProdDetails.basePrice;
      
      let orderData = {
        name: formData.name,
        phone: formData.phone,
        deliveryAddress: `${formData.address}, ${formData.city}, ${formData.pincode}`,
        frequency: selectedFreq === 'daily' ? 'Daily' : selectedFreq === 'alt' ? 'Alternate Days' : 'Weekly',
        totalAmount: priceNum * 30, // Estimating 30 days
        items: [{
          name: `${selectedProdDetails.name} (${selectedUnit})`,
          quantity: 1,
          price: priceNum
        }],
        paymentMethod: method,
        isPaid: isPaid
      };

      if (paymentId) {
        orderData.paymentResult = {
          id: paymentId,
          status: 'paid',
          update_time: new Date().toISOString()
        };
      }

      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr && userInfoStr !== 'undefined') {
        try {
          orderData.user = JSON.parse(userInfoStr)._id;
        } catch (e) {
          console.error(e);
        }
      }

      const res = await api.post('/api/subscriptions', orderData);

      if (res.data) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online? Check if an adblocker is active.');
      return;
    }

    if (!window.Razorpay) {
      alert('Razorpay failed to initialize. Please check your browser settings.');
      return;
    }

    try {
      const selectedProdDetails = products.find(p => p.id === selectedProduct);
      const priceNum = selectedUnit === '500 ml' ? Math.ceil(selectedProdDetails.basePrice / 2) : selectedProdDetails.basePrice;
      const total = priceNum * 30; // 30 days upfront

      // Create order on backend
      const baseUrl = import.meta.env.MODE === 'development' ? 'http://localhost:5001' : 'https://milquu-backend.onrender.com';
      const orderRes = await fetch(`${baseUrl}/api/payment/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total })
      });
      const orderData = await orderRes.json();

      if (!orderData || !orderData.id) {
        alert('Failed to initialize payment. Please try again.');
        return;
      }

      // Fetch Razorpay Key dynamically instead of using dummy key
      const keyRes = await fetch(`${baseUrl}/api/payment/key`);
      const { key } = await keyRes.json();

      const options = {
        key: key, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Milquu Fresh",
        description: "Monthly Subscription Upfront",
        order_id: orderData.id,
        handler: async function (response) {
          await saveSubscription(response.razorpay_payment_id, paymentMethod === 'PHONEPE' ? 'PhonePe' : paymentMethod === 'GPAY' ? 'GPay' : 'Cred', true);
        },
        prefill: {
          name: formData.name,
          contact: formData.phone,
          method: 'upi'
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay using UPI',
                instruments: [
                  {
                    method: 'upi'
                  }
                ]
              }
            },
            sequence: ['block.upi'],
            preferences: {
              show_default_blocks: false
            }
          }
        },
        theme: {
          color: paymentMethod === 'PHONEPE' ? "#5f259f" : paymentMethod === 'GPAY' ? "#1a73e8" : "#000000" 
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response){
        alert("Payment Failed: " + response.error.description);
      });
      paymentObject.open();
      
    } catch (error) {
      console.error(error);
      alert('Error connecting to payment gateway.');
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
        <img src="/img/cowmilk.webp" alt="Cow Milk Background" className="w-full h-auto object-contain" />
      </motion.div>

      <motion.div 
        animate={{ y: [0, 40, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-60 lg:bottom-60 -right-8 lg:right-20 w-[100px] sm:w-[140px] lg:w-[200px] opacity-60 lg:opacity-100 drop-shadow-2xl pointer-events-none z-0"
      >
        <img src="/img/buffalomilk.webp" alt="Buffalo Milk Background" className="w-full h-auto object-contain" />
      </motion.div>

      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute top-48 lg:top-60 right-0 lg:right-40 w-[80px] sm:w-[120px] lg:w-[160px] opacity-60 lg:opacity-100 drop-shadow-2xl pointer-events-none z-0"
      >
        <img src="/img/A2milk.webp" alt="A2 Milk Background" className="w-full h-auto object-contain" />
      </motion.div>

      <div className="max-w-4xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header text removed as requested */}

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
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-6">
                {products.map(product => {
                  const currentPrice = selectedUnit === '500 ml' ? Math.ceil(product.basePrice / 2) : product.basePrice;
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => setSelectedProduct(product.id)}
                      className={`relative p-2 sm:p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center ${
                        selectedProduct === product.id 
                        ? 'border-milquu-gold bg-[#FFFDF9] shadow-md scale-[1.02]' 
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {selectedProduct === product.id && (
                        <div className="absolute top-2 right-2 text-milquu-gold z-10">
                          <CheckCircle2 size={16} className="sm:w-5 sm:h-5" />
                        </div>
                      )}
                      <div className="h-16 sm:h-20 w-full flex items-center justify-center mb-2">
                        <img src={product.image} alt={product.name} className="h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <span className="font-sans font-bold text-[10px] sm:text-xs text-milquu-dark mb-0.5 leading-tight">{product.name}</span>
                      <span className="text-[9px] sm:text-xs font-sans font-medium text-gray-500">₹{currentPrice}/{selectedUnit === '500 ml' ? '500ml' : 'L'}</span>
                    </button>
                  );
                })}
              </div>

              {/* Unit Selector */}
              <div className="flex justify-center mt-6">
                <div className="flex bg-gray-100/80 p-1.5 rounded-full border border-gray-200/50">
                  <button
                    type="button"
                    onClick={() => setSelectedUnit('1 Litre')}
                    className={`px-6 py-2 sm:px-8 sm:py-3 rounded-full text-sm font-bold transition-all duration-300 ${selectedUnit === '1 Litre' ? 'bg-white text-milquu-gold shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    1 Litre
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUnit('500 ml')}
                    className={`px-6 py-2 sm:px-8 sm:py-3 rounded-full text-sm font-bold transition-all duration-300 ${selectedUnit === '500 ml' ? 'bg-white text-milquu-gold shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    500 ml
                  </button>
                </div>
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

            {/* Step 3: Time Selection removed as delivery is only morning */}

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

            {/* Step 5: Payment Method */}
            <div className="pt-6">
              <h3 className="text-2xl font-serif font-bold text-milquu-dark mb-6">Payment Method</h3>
              
              <div className="space-y-4">
                <label htmlFor="payment-phonepe" className={`flex items-center p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'PHONEPE' ? 'bg-[#5f259f]/10 border-[#5f259f]/50 shadow-sm' : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50'}`}>
                  <input 
                    id="payment-phonepe"
                    type="radio" 
                    name="payment" 
                    value="PHONEPE" 
                    checked={paymentMethod === 'PHONEPE'}
                    onChange={() => setPaymentMethod('PHONEPE')}
                    className="mr-4 w-5 h-5 text-[#5f259f] focus:ring-[#5f259f]"
                  />
                  <div className="flex-1 flex items-center space-x-3 sm:space-x-4">
                    <div className="w-16 h-12 flex items-center justify-center bg-white rounded-lg border border-gray-100 p-1 shadow-sm">
                      <img src="https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png" alt="PhonePe" className="h-full w-full object-contain" />
                    </div>
                    <div>
                      <span className="font-bold text-base text-milquu-dark block">PhonePe</span>
                      <span className="text-sm text-gray-500">Pay directly using PhonePe UPI</span>
                    </div>
                  </div>
                </label>

                <label htmlFor="payment-gpay" className={`flex items-center p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'GPAY' ? 'bg-[#1a73e8]/10 border-[#1a73e8]/50 shadow-sm' : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50'}`}>
                  <input 
                    id="payment-gpay"
                    type="radio" 
                    name="payment" 
                    value="GPAY" 
                    checked={paymentMethod === 'GPAY'}
                    onChange={() => setPaymentMethod('GPAY')}
                    className="mr-4 w-5 h-5 text-[#1a73e8] focus:ring-[#1a73e8]"
                  />
                  <div className="flex-1 flex items-center space-x-3 sm:space-x-4">
                    <div className="w-16 h-12 flex items-center justify-center bg-white rounded-lg border border-gray-100 p-1 shadow-sm">
                      <img src="https://pay.google.com/about/static_kcs/images/logos/google-pay-logo.svg" alt="GPay" className="h-full w-full object-contain" />
                    </div>
                    <div>
                      <span className="font-bold text-base text-milquu-dark block">Google Pay</span>
                      <span className="text-sm text-gray-500">Pay directly using GPay UPI</span>
                    </div>
                  </div>
                </label>

                <label htmlFor="payment-cred" className={`flex items-center p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'CRED' ? 'bg-black/5 border-black/50 shadow-sm' : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50'}`}>
                  <input 
                    id="payment-cred"
                    type="radio" 
                    name="payment" 
                    value="CRED" 
                    checked={paymentMethod === 'CRED'}
                    onChange={() => setPaymentMethod('CRED')}
                    className="mr-4 w-5 h-5 text-black focus:ring-black"
                  />
                  <div className="flex-1 flex items-center space-x-3 sm:space-x-4">
                    <div className="w-16 h-12 flex items-center justify-center bg-black rounded-lg border border-gray-100 p-2 shadow-sm">
                      <img src="https://cred.club/assets/images/cred-logo-white.svg" alt="CRED"
                        onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                        className="h-full w-full object-contain" />
                      <span style={{display:'none'}} className="text-white font-black text-lg tracking-widest">CRED</span>
                    </div>
                    <div>
                      <span className="font-bold text-base text-milquu-dark block">CRED UPI</span>
                      <span className="text-sm text-gray-500">Pay directly using CRED UPI</span>
                    </div>
                  </div>
                </label>
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
