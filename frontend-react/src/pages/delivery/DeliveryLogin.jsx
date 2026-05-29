import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, LogIn, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const DeliveryLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data } = await axios.post('https://milquu-backend.onrender.com/api/delivery/login', {
        email,
        password
      });

      localStorage.setItem('deliveryStaff', JSON.stringify(data));
      navigate('/delivery');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-green-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-milquu-blue rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-milquu-blue/30">
            <Truck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-milquu-dark">Delivery Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in with your staff credentials.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-milquu-blue/30 focus:border-milquu-blue outline-none transition-all"
                placeholder="staff@milquu.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-milquu-blue/30 focus:border-milquu-blue outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-milquu-dark text-white py-3.5 rounded-xl text-sm font-bold shadow-md shadow-gray-900/20 flex items-center justify-center transition-all hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <LogIn size={18} className="mr-2" /> Sign In
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-8">
          Contact the admin if you don't have login credentials.
        </p>

      </motion.div>
    </div>
  );
};

export default DeliveryLogin;
