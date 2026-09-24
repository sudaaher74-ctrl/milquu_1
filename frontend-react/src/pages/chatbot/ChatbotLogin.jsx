import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api.js';
import { Mail, Lock, LogIn, Bot, Eye, EyeOff, Sparkles, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const DEFAULT_ADMIN_EMAIL = 'milquufresh@gmail.com';
const DEFAULT_ADMIN_PASSWORD = 'milquu@2026';

const ChatbotLogin = () => {
  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [password, setPassword] = useState(DEFAULT_ADMIN_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/chatbot';

  const handleFillCredentials = () => {
    setEmail(DEFAULT_ADMIN_EMAIL);
    setPassword(DEFAULT_ADMIN_PASSWORD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Using admin login since chatbot requires admin privileges currently, 
      // but we store it separately so it's a distinct portal.
      const { data } = await api.post('/api/admin/login', {
        email: email.trim(),
        password
      });

      localStorage.setItem('chatbotToken', JSON.stringify(data));
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] to-white flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full blur-[100px] bg-milquu-blue/10 opacity-60"></div>
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full blur-[100px] bg-milquu-gold/10 opacity-60"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-milquu-blue to-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-milquu-blue/30">
            <Bot size={32} />
          </div>
          <h1 className="text-2xl font-bold text-milquu-dark">Milquu AI Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in with administrative credentials.</p>
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
                className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-milquu-gold focus:border-transparent outline-none transition-all duration-300"
                placeholder={DEFAULT_ADMIN_EMAIL}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl pl-11 pr-11 py-3.5 text-sm focus:ring-2 focus:ring-milquu-gold focus:border-transparent outline-none transition-all duration-300"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-milquu-blue to-indigo-600 text-white py-3.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:transform-none disabled:cursor-not-allowed mt-2"
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

        {/* Quick Fill Admin Credentials Card */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                <Sparkles size={14} className="text-indigo-600 flex-shrink-0" />
                <span>Admin Login Credentials</span>
              </div>
              <p className="text-[11px] text-indigo-700/90 font-mono mt-0.5 truncate">
                {DEFAULT_ADMIN_EMAIL}
              </p>
              <p className="text-[11px] text-indigo-700/80 font-mono">
                Password: <span className="font-semibold">{DEFAULT_ADMIN_PASSWORD}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleFillCredentials}
              className="flex-shrink-0 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-indigo-600" />
                  <span>Filled!</span>
                </>
              ) : (
                <span>Auto-Fill</span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatbotLogin;
