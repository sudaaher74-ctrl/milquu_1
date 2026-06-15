import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, CheckCircle, ShieldCheck, Truck, Star, Sparkles, MapPinOff } from 'lucide-react';
import api from '../../utils/api';

const FreeSampleCampaign = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Form, 2: Success
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    whatsappNumber: '',
    selectedProduct: 'A2 Cow Milk',
    address: {
      houseFlat: '',
      buildingSociety: '',
      streetArea: '',
      landmark: '',
      city: 'Navi Mumbai',
      pincode: ''
    },
    location: {
      latitude: null,
      longitude: null,
      mapsUrl: ''
    },
    preferredDeliveryTime: 'Morning',
    deliveryInstructions: '',
    firstTime: false,
    promotional: true
  });

  // Dummy stats
  const [claimedSamples, setClaimedSamples] = useState(1247);
  
  useEffect(() => {
    // Check if they already claimed
    if (localStorage.getItem('freeSampleClaimed')) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleInputChange = (e, section = null) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: val
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: val
      }));
    }
  };

  const selectProduct = (product) => {
    setFormData(prev => ({ ...prev, selectedProduct: product }));
  };

  const getLocation = (e) => {
    e.preventDefault();
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          location: {
            latitude,
            longitude,
            mapsUrl: `https://maps.google.com/?q=${latitude},${longitude}`
          }
        }));
        setError('');
      },
      (err) => {
        setError('Unable to retrieve your location. Please check browser permissions.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstTime) {
      setError('You must confirm this is your first time claiming a sample.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Build final payload
      const payload = {
        fullName: formData.fullName,
        mobileNumber: formData.mobileNumber,
        whatsappNumber: formData.whatsappNumber || formData.mobileNumber,
        selectedProduct: formData.selectedProduct,
        address: formData.address,
        location: formData.location,
        preferredDeliveryTime: formData.preferredDeliveryTime,
        deliveryInstructions: formData.deliveryInstructions,
        deviceType: /Mobile|Android|iP(ad|hone)/.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
      };

      await api.post('/api/free-sample/submit', payload);
      
      // Store in local storage
      localStorage.setItem('freeSampleClaimed', 'true');
      setStep(2);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const skipToHome = () => {
    localStorage.setItem('freeSampleClaimed', 'skipped');
    navigate('/', { replace: true });
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-milquu-cream flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[32px] p-8 md:p-12 max-w-lg w-full text-center shadow-2xl border border-gray-100"
        >
          <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-milquu-dark mb-4">🎉 Your Free Sample Is Reserved!</h2>
          <p className="text-gray-600 font-medium mb-8">
            Thank you for choosing Milquu Fresh. Our team will contact you shortly to confirm delivery.
          </p>
          <div className="flex flex-col space-y-4">
            <button 
              onClick={() => navigate('/', { replace: true })}
              className="w-full py-4 bg-milquu-dark text-white rounded-full font-bold shadow-lg hover:bg-black transition-colors"
            >
              Enter Website
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col lg:flex-row overflow-x-hidden relative font-sans">
      
      {/* SKIP BUTTON */}
      <button 
        onClick={skipToHome}
        className="absolute top-4 right-4 z-50 text-gray-400 hover:text-gray-600 text-sm font-medium underline"
      >
        Skip & Go to Website
      </button>

      {/* LEFT SIDE - VISUALS & COPY (Desktop) */}
      <div className="hidden lg:flex lg:w-5/12 bg-milquu-dark text-white flex-col justify-center p-12 xl:p-16 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/20 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10">
          <img src="/brand-logo.jpg" alt="MilQuu Fresh" className="h-16 w-16 rounded-full mb-8 shadow-xl border-2 border-white/10" />
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block py-1.5 px-4 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold tracking-widest mb-6 border border-blue-500/30 uppercase">
              🎁 Limited Launch Offer
            </span>
            <h1 className="text-5xl xl:text-6xl font-serif font-bold leading-[1.1] mb-6">
              Get Your <span className="text-milquu-gold italic">FREE</span> Farm Fresh Milk Sample
            </h1>
            <p className="text-lg text-gray-300 font-medium leading-relaxed mb-10 max-w-md">
              Experience pure farm-fresh dairy delivered directly to your doorstep. No commitments, just pure goodness.
            </p>
          </motion.div>

          <div className="space-y-4 mb-12">
            {[
              { icon: <ShieldCheck />, text: '100% Pure & Adulteration Free' },
              { icon: <CheckCircle />, text: 'No Preservatives Added' },
              { icon: <Truck />, text: 'Fresh Daily Delivery by 7 AM' }
            ].map((item, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.6, delay: 0.3 + (idx * 0.1) }}
                key={idx} 
                className="flex items-center space-x-3 text-gray-200"
              >
                <div className="text-green-400">{item.icon}</div>
                <span className="font-medium text-lg">{item.text}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md w-max">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-milquu-dark bg-gray-200 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div>
              <div className="flex text-milquu-gold text-sm mb-0.5">
                {[...Array(5)].map((_,i)=><Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs text-gray-300"><strong className="text-white">500+</strong> Families Trust Us</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - FORM (Desktop) & FULL VIEW (Mobile) */}
      <div className="w-full lg:w-7/12 flex flex-col p-4 sm:p-8 lg:p-12 xl:p-16 relative">
        
        {/* Mobile Header elements */}
        <div className="lg:hidden text-center mt-6 mb-8">
          <img src="/brand-logo.jpg" alt="MilQuu" className="h-12 w-12 rounded-full mx-auto mb-4 shadow-md" />
          <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-milquu-blue text-[11px] font-bold tracking-wider mb-3">
            🎁 FREE SAMPLE OFFER
          </span>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark mb-2 leading-tight">
            Get Your First Milk Sample <span className="text-milquu-gold italic">Free</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium px-4">
            Fresh milk delivered directly to your doorstep.
          </p>
        </div>

        {/* Urgency Bar */}
        <div className="max-w-2xl w-full mx-auto mb-8 bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-orange-800 font-bold text-sm">Hurry! Limited slots left</p>
            <p className="text-orange-600 text-xs mt-0.5">Only 150 Free Samples Remaining</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-gray-500 mb-1">{claimedSamples} Claimed</span>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: '85%' }} 
                transition={{ duration: 1.5, delay: 0.5 }}
                className="h-full bg-orange-500 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* FORM CONTAINER */}
        <div className="max-w-2xl w-full mx-auto bg-white rounded-[24px] shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8 relative overflow-hidden">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {/* PRODUCT SELECTION */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 block">Select Your Free Sample *</label>
              <div className="grid grid-cols-2 gap-3">
                {['A2 Cow Milk', 'Buffalo Milk'].map(prod => (
                  <div 
                    key={prod}
                    onClick={() => selectProduct(prod)}
                    className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 flex flex-col items-center text-center ${
                      formData.selectedProduct === prod 
                        ? 'border-milquu-blue bg-blue-50 shadow-sm' 
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    {formData.selectedProduct === prod && (
                      <div className="absolute top-2 right-2 text-milquu-blue">
                        <CheckCircle className="w-5 h-5 fill-current bg-white rounded-full" />
                      </div>
                    )}
                    <img src={prod.includes('Cow') ? '/img/products/cowmilk.webp' : '/img/products/buffalomilk.webp'} alt={prod} className="w-16 h-16 object-contain mb-2" />
                    <span className={`font-bold text-sm ${formData.selectedProduct === prod ? 'text-milquu-blue' : 'text-gray-700'}`}>{prod}</span>
                    <span className="text-[11px] text-gray-500 mt-0.5">500ml Pack</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PERSONAL DETAILS */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700 block border-b border-gray-100 pb-2">Personal Details</label>
              
              <div>
                <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Full Name *" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-milquu-blue focus:border-milquu-blue block p-3.5 outline-none transition-all" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} placeholder="Mobile Number *" pattern="[0-9]{10}" title="10 digit mobile number" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-milquu-blue focus:border-milquu-blue block p-3.5 outline-none transition-all" />
                <input type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleInputChange} placeholder="WhatsApp Number (Optional)" pattern="[0-9]{10}" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-milquu-blue focus:border-milquu-blue block p-3.5 outline-none transition-all" />
              </div>
            </div>

            {/* ADDRESS DETAILS */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <label className="text-sm font-bold text-gray-700">Delivery Address</label>
                <button type="button" onClick={getLocation} className="text-xs font-bold text-milquu-blue bg-blue-50 px-3 py-1.5 rounded-lg flex items-center hover:bg-blue-100 transition-colors">
                  {formData.location.latitude ? <CheckCircle className="w-3.5 h-3.5 mr-1" /> : <MapPin className="w-3.5 h-3.5 mr-1" />}
                  {formData.location.latitude ? 'Location Saved' : 'Use Current GPS'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required type="text" name="houseFlat" value={formData.address.houseFlat} onChange={(e) => handleInputChange(e, 'address')} placeholder="House / Flat No. *" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-milquu-blue focus:border-milquu-blue block p-3.5 outline-none transition-all" />
                <input required type="text" name="buildingSociety" value={formData.address.buildingSociety} onChange={(e) => handleInputChange(e, 'address')} placeholder="Building / Society Name *" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-milquu-blue focus:border-milquu-blue block p-3.5 outline-none transition-all" />
              </div>

              <input required type="text" name="streetArea" value={formData.address.streetArea} onChange={(e) => handleInputChange(e, 'address')} placeholder="Street / Area *" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-milquu-blue focus:border-milquu-blue block p-3.5 outline-none transition-all" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required type="text" name="pincode" value={formData.address.pincode} onChange={(e) => handleInputChange(e, 'address')} placeholder="Pincode *" pattern="[0-9]{6}" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-milquu-blue focus:border-milquu-blue block p-3.5 outline-none transition-all" />
                <select required name="city" value={formData.address.city} onChange={(e) => handleInputChange(e, 'address')} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-milquu-blue focus:border-milquu-blue block p-3.5 outline-none transition-all">
                  <option value="Navi Mumbai">Navi Mumbai</option>
                  <option value="Panvel">Panvel</option>
                  <option value="Kharghar">Kharghar</option>
                  <option value="Belapur">Belapur</option>
                  <option value="Nerul">Nerul</option>
                </select>
              </div>
            </div>

            {/* PREFERENCES */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700 block border-b border-gray-100 pb-2">Delivery Preferences</label>
              
              <div className="flex space-x-4">
                {['Morning', 'Evening'].map(time => (
                  <label key={time} className="flex-1 flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="radio" name="preferredDeliveryTime" value={time} checked={formData.preferredDeliveryTime === time} onChange={handleInputChange} className="w-4 h-4 text-milquu-blue border-gray-300 focus:ring-milquu-blue" />
                    <span className="ml-2 text-sm font-medium text-gray-700">{time} Delivery</span>
                  </label>
                ))}
              </div>

              <input type="text" name="deliveryInstructions" value={formData.deliveryInstructions} onChange={handleInputChange} placeholder="Any specific instructions (e.g., Leave at door)" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-milquu-blue focus:border-milquu-blue block p-3.5 outline-none transition-all" />
            </div>

            {/* CONSENT CHECKBOXES */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start cursor-pointer">
                <input required type="checkbox" name="firstTime" checked={formData.firstTime} onChange={handleInputChange} className="mt-1 w-4 h-4 text-milquu-blue border-gray-300 rounded focus:ring-milquu-blue" />
                <span className="ml-3 text-xs sm:text-sm text-gray-600">I confirm that I am claiming this free sample for the first time. *</span>
              </label>
              <label className="flex items-start cursor-pointer">
                <input type="checkbox" name="promotional" checked={formData.promotional} onChange={handleInputChange} className="mt-1 w-4 h-4 text-milquu-blue border-gray-300 rounded focus:ring-milquu-blue" />
                <span className="ml-3 text-xs sm:text-sm text-gray-600">I agree to receive delivery updates and promotional offers on WhatsApp.</span>
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-[0_8px_20px_rgba(0,87,255,0.3)] transition-all flex items-center justify-center ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-gradient-to-r from-milquu-blue to-[#0046CC] hover:scale-[1.02] hover:shadow-[0_12px_25px_rgba(0,87,255,0.4)]'}`}
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Claim My Free Sample Now
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-2">By submitting, you agree to our Terms & Conditions. Offer valid for limited areas.</p>
          </form>
        </div>

      </div>
    </div>
  );
};

export default FreeSampleCampaign;
