import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, CheckCircle, ArrowRight, ShoppingCart, Lock } from 'lucide-react';
import DeliverySlotSelector from '../components/cart/DeliverySlotSelector';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, addToCart } = useCart();
  const [step, setStep] = useState(1); // 1: View Cart, 2: Checkout Form, 3: Success
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', city: '', pincode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [allProducts, setAllProducts] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null); // { id, deliveryDate, window }

  const baseUrl = import.meta.env.MODE === 'development' ? 'http://localhost:5001' : 'https://milquu-backend.onrender.com';

  useEffect(() => {
    fetch(`${baseUrl}/api/products`)
      .then(res => res.json())
      .then(data => setAllProducts(data))
      .catch(err => console.error(err));
  }, []);

  const recommendedProducts = allProducts.filter(p => !cartItems.find(item => item._id === p._id || item.id === p.id));

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    const priceNum = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.-]+/g,"")) : item.price;
    return total + (priceNum * item.quantity);
  }, 0);
  
  const deliveryFee = 0; // Free delivery for now
  const total = subtotal + deliveryFee;

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

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSlot) {
      alert('Please choose a delivery slot before placing your order.');
      return;
    }

    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(formData.name)) {
      alert("Please enter a valid name without numbers or special characters.");
      return;
    }
    
    if (paymentMethod === 'COD') {
      await saveOrder(null, 'COD', 'PENDING');
    } else {
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
        // Create order on backend
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

        // Fetch Razorpay Key
        const keyRes = await fetch(`${baseUrl}/api/payment/key`);
        const { key } = await keyRes.json();

        const options = {
          key: key, // Use dynamically fetched key
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Milquu Fresh",
          description: "Farm Fresh Milk Delivery",
          order_id: orderData.id,
          handler: async function (response) {
            try {
              // Verify payment on backend
              const verifyRes = await fetch(`${baseUrl}/api/payment/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                await saveOrder(response.razorpay_payment_id, 'ONLINE', 'PAID', {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                });
              } else {
                alert('Payment verification failed.');
              }
            } catch (err) {
              console.error(err);
              alert('Error verifying payment.');
            }
          },
          prefill: {
            name: formData.name,
            contact: formData.phone,
            method: paymentMethod !== 'COD' && paymentMethod !== 'ONLINE' ? 'upi' : undefined
          },
          theme: {
            color: paymentMethod === 'PHONEPE' ? "#5f259f" : paymentMethod === 'GPAY' ? "#1a73e8" : paymentMethod === 'CRED' ? "#000000" : "#D3AC67" 
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
    }
  };

  const saveOrder = async (paymentId, method, paymentStatus, razorpayDetails = {}) => {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const userId = userInfoStr && userInfoStr !== 'undefined' ? JSON.parse(userInfoStr)._id : undefined;

      const orderData = {
        user: userId,
        name: formData.name,
        phone: formData.phone,
        orderItems: cartItems.map(item => ({
          product: item._id || item.id,
          name: item.name,
          qty: item.quantity,
          image: item.image,
          price: typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.-]+/g,"")) : item.price
        })),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.pincode,
          country: 'India'
        },
        paymentMethod: method,
        paymentStatus: paymentStatus,
        razorpayOrderId: razorpayDetails.razorpayOrderId,
        razorpayPaymentId: razorpayDetails.razorpayPaymentId,
        razorpaySignature: razorpayDetails.razorpaySignature,
        isPaid: paymentStatus === 'PAID',
        paymentResult: paymentId ? {
          id: paymentId,
          status: 'paid',
          update_time: new Date().toISOString()
        } : undefined,
        totalPrice: total,
        orderSource: 'Website',
        deliverySlot: selectedSlot?.id || 'Morning',
        scheduledDeliveryDate: selectedSlot?.deliveryDate || null,
        scheduledDeliveryWindow: selectedSlot?.window || '4:00 AM – 7:00 AM',
      };

      const res = await fetch(`${baseUrl}/api/erp/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        setStep(3); // Success page
        clearCart();
      } else {
        alert("Failed to submit order to our system. Please contact support.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while submitting order.");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] to-white pt-24 pb-12 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="bg-white/90 backdrop-blur-2xl p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white text-center max-w-md mx-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-milquu-green/5 to-milquu-gold/5 pointer-events-none"></div>
          <div className="relative z-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-milquu-green/20 to-milquu-green/5 rounded-full flex items-center justify-center mx-auto mb-6 text-milquu-green shadow-inner"
            >
              <CheckCircle size={40} />
            </motion.div>
            <h2 className="text-3xl font-serif font-bold text-milquu-dark mb-3">Order Confirmed! 🥛</h2>
            <p className="text-gray-600 text-base font-sans mb-6">
            Thank you, {formData.name}. Your order has been placed!
          </p>
          {selectedSlot && (
            <div className="bg-milquu-green/5 border border-milquu-green/20 rounded-xl p-3 mb-4 text-sm">
              <p className="font-bold text-milquu-dark">
                {selectedSlot.id === 'Morning' ? '🌅' : '🌇'} {selectedSlot.id} Delivery
              </p>
              <p className="text-gray-600 text-xs mt-1">
                📅 {selectedSlot.deliveryDate?.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
              </p>
              <p className="text-gray-600 text-xs">⏰ {selectedSlot.window}</p>
            </div>
          )}
            <Link to="/">
              <button className="bg-milquu-dark hover:bg-milquu-gold text-white px-8 py-3.5 rounded-full font-sans text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-2">
                Return Home
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] to-white pt-28 pb-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-[40vh] pointer-events-none bg-milquu-gold/5 rounded-b-[120px]"></div>
      <div className="absolute top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] bg-milquu-green/10 opacity-40 pointer-events-none"></div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 relative z-10">
        
        {step === 1 ? (
          <Link to="/products" className="inline-flex items-center text-gray-400 hover:text-milquu-dark font-sans text-sm mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Continue Shopping
          </Link>
        ) : (
          <button onClick={() => setStep(1)} className="inline-flex items-center text-gray-400 hover:text-milquu-dark font-sans text-sm mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to Cart
          </button>
        )}

        {cartItems.length === 0 && step === 1 ? (
          <div className="text-center py-12 bg-white/50 backdrop-blur-lg rounded-[24px] border border-white/60 shadow-sm">
            <h2 className="text-xl font-serif text-gray-400 mb-4">Your cart is perfectly empty.</h2>
            <Link to="/products">
              <button className="bg-milquu-gold hover:bg-milquu-green text-white px-6 py-2.5 rounded-full font-sans text-sm font-bold shadow-md transition-colors">
                Explore Farm Fresh Products
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-2xl p-6 sm:p-8 rounded-[24px] border border-white/60 shadow-xl relative overflow-hidden">
            
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-serif font-bold text-milquu-dark">
                {step === 1 ? 'Your Cart' : 'Checkout'}
              </h1>
              <div className="flex items-center space-x-2 text-sm font-sans">
                <span className={`font-bold ${step === 1 ? 'text-milquu-dark' : 'text-gray-400'}`}>1. Cart</span>
                <span className="text-gray-300">-</span>
                <span className={`font-bold ${step === 2 ? 'text-milquu-dark' : 'text-gray-400'}`}>2. Delivery</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Cart Items List */}
                  <div className="space-y-4">
                    <AnimatePresence>
                      {cartItems.map((item) => (
                        <motion.div 
                          key={item._id || item.id}
                          layout
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                          className="flex items-center justify-between border border-gray-100 bg-white/60 hover:bg-white p-4 rounded-2xl mb-3 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center p-1">
                              <img src={item.image} alt={item.name} className="h-full object-contain" />
                            </div>
                            <div>
                              <h3 className="text-sm sm:text-base font-serif font-bold text-milquu-dark">{item.name}</h3>
                              <p className="text-gray-500 font-sans text-xs">{item.unit}</p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-6">
                            <div className="flex items-center space-x-2 bg-gray-50/80 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-100">
                              <button onClick={() => updateQuantity(item._id || item.id, -1)} className="text-gray-400 hover:text-milquu-dark">
                                <Minus size={14} />
                              </button>
                              <span className="font-sans font-bold text-sm w-4 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item._id || item.id, 1)} className="text-gray-400 hover:text-milquu-dark">
                                <Plus size={14} />
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm sm:text-base font-sans font-bold text-milquu-dark">
                                ₹{(typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.-]+/g,"")) : item.price) * item.quantity}
                              </span>
                              <button onClick={() => removeFromCart(item._id || item.id)} className="text-gray-300 hover:text-red-400">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Calculations */}
                  <div className="bg-gray-50/50 p-4 rounded-2xl font-sans text-sm space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-semibold">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery</span>
                      <span className="font-semibold text-milquu-green">Free</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
                      <span className="text-base font-bold text-milquu-dark">Total</span>
                      <span className="text-xl font-sans font-bold text-milquu-dark">₹{total}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setStep(2)}
                    className="w-full bg-milquu-dark hover:bg-milquu-gold text-white px-4 py-3.5 rounded-full font-sans font-bold text-sm transition-colors shadow-md flex items-center justify-center"
                  >
                    Proceed to Checkout <ArrowRight size={16} className="ml-2" />
                  </button>

                  {/* Recommended Products */}
                  {recommendedProducts.length > 0 && (
                    <div className="pt-6 mt-6 border-t border-gray-100">
                      <h3 className="text-lg font-serif font-bold text-milquu-dark mb-4">You Might Also Like</h3>
                      <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                        {recommendedProducts.map(product => (
                          <div key={product._id || product.id} className="min-w-[140px] max-w-[140px] bg-white border border-gray-100 rounded-2xl p-3 snap-start shadow-sm flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <img src={product.image} className="h-16 object-contain mx-auto mb-3 drop-shadow-md group-hover:scale-110 transition-transform duration-300" alt={product.name} />
                            <h4 className="font-serif font-bold text-sm text-milquu-dark leading-tight mb-1">{product.name}</h4>
                            <p className="text-[10px] text-gray-500 font-sans mb-2">{product.unit}</p>
                            <div className="flex justify-between items-center mt-auto">
                              <span className="font-sans font-bold text-sm text-milquu-dark">₹{typeof product.price === 'number' ? product.price : product.price.replace('₹','')}</span>
                              <button 
                                onClick={() => addToCart(product)} 
                                className="bg-milquu-green/10 text-milquu-green p-1.5 rounded-full hover:bg-milquu-green hover:text-white transition-colors"
                              >
                                <ShoppingCart size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                    <h4 className="font-serif font-bold text-milquu-dark text-sm mb-3">Delivery Details</h4>
                    
                    {/* Delivery Slot Selector */}
                    <DeliverySlotSelector
                      value={selectedSlot?.id || null}
                      onChange={(id, deliveryDate, window) => setSelectedSlot({ id, deliveryDate, window })}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input required type="text" name="name" pattern="[A-Za-z\s]+" title="Name should only contain letters and spaces" placeholder="Full Name" onChange={handleInputChange} className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-milquu-gold/50 shadow-sm transition-all hover:bg-white" />
                      <input required type="tel" name="phone" placeholder="Phone Number" onChange={handleInputChange} className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-milquu-gold/50 shadow-sm transition-all hover:bg-white" />
                    </div>
                    
                    <textarea required name="address" placeholder="Full Delivery Address" onChange={handleInputChange} rows="2" className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-milquu-gold/50 shadow-sm transition-all hover:bg-white resize-none"></textarea>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <select required name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-milquu-gold/50 shadow-sm transition-all hover:bg-white appearance-none text-gray-600">
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
                      <input required type="text" name="pincode" placeholder="Pincode" onChange={handleInputChange} className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-milquu-gold/50 shadow-sm transition-all hover:bg-white" />
                    </div>

                    <div className="mt-4 space-y-3">
                      <h4 className="font-serif font-bold text-milquu-dark text-sm mb-2">Payment Method</h4>
                      
                      <label htmlFor="payment-cod" className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${paymentMethod === 'COD' ? 'bg-milquu-gold/5 border-milquu-gold shadow-[0_4px_20px_-4px_rgba(211,172,103,0.3)] scale-[1.02]' : 'bg-white/60 border-gray-100 hover:bg-white hover:shadow-md hover:-translate-y-0.5'}`}>
                        <input 
                          id="payment-cod"
                          type="radio" 
                          name="payment" 
                          value="COD" 
                          checked={paymentMethod === 'COD'}
                          onChange={() => setPaymentMethod('COD')}
                          className="mr-4 w-5 h-5 text-milquu-gold focus:ring-milquu-gold"
                        />
                        <div className="flex-1 flex items-center space-x-3 sm:space-x-4">
                          <div className="w-16 h-12 flex items-center justify-center bg-white rounded-lg border border-gray-100 p-2 shadow-sm">
                            <span className="font-bold text-milquu-dark text-xl">💵</span>
                          </div>
                          <div>
                            <span className="font-bold text-base text-milquu-dark block">Cash on Delivery</span>
                            <span className="text-sm text-gray-500">Pay with cash when milk arrives</span>
                          </div>
                        </div>
                      </label>

                      <label htmlFor="payment-phonepe" className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${paymentMethod === 'PHONEPE' ? 'bg-[#5f259f]/5 border-[#5f259f] shadow-[0_4px_20px_-4px_rgba(95,37,159,0.3)] scale-[1.02]' : 'bg-white/60 border-gray-100 hover:bg-white hover:shadow-md hover:-translate-y-0.5'}`}>
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

                      <label htmlFor="payment-gpay" className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${paymentMethod === 'GPAY' ? 'bg-[#1a73e8]/5 border-[#1a73e8] shadow-[0_4px_20px_-4px_rgba(26,115,232,0.3)] scale-[1.02]' : 'bg-white/60 border-gray-100 hover:bg-white hover:shadow-md hover:-translate-y-0.5'}`}>
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

                      <label htmlFor="payment-cred" className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${paymentMethod === 'CRED' ? 'bg-black/5 border-black shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] scale-[1.02]' : 'bg-white/60 border-gray-100 hover:bg-white hover:shadow-md hover:-translate-y-0.5'}`}>
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

                    <button 
                      type="submit"
                      className="w-full bg-milquu-dark hover:bg-milquu-gold text-white px-4 py-3.5 rounded-full font-sans font-bold text-sm transition-colors shadow-md mt-6"
                    >
                      {paymentMethod === 'COD' ? `Place Order (Pay ₹${total} on Delivery)` : `Pay ₹${total} Now`}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
