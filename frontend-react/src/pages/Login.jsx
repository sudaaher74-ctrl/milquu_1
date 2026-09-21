import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, Lock, LogIn, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();



  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/users/google-login', { token: credentialResponse.credential });
      login(data);
      navigate(location.state?.from || '/account', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/users/login', { phone, password });
      login(data);
      navigate(location.state?.from || '/account', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans pt-32 pb-24 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full blur-[100px] bg-milquu-blue/10 opacity-60"></div>
        <div className="absolute bottom-20 -right-20 w-[500px] h-[500px] rounded-full blur-[120px] bg-milquu-gold/20 opacity-50"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="mt-6 text-center text-4xl font-extrabold font-serif text-milquu-dark">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to manage your subscriptions and orders
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-2xl py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-[24px] sm:px-10 border border-white/60 relative overflow-hidden">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-red-50 text-red-500 p-3 rounded-lg text-sm font-medium mb-6 text-center"
            >
              {error}
            </motion.div>
          )}

          <div className="mb-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login Failed')}
              useOneTap
              theme="outline"
              size="large"
              width="100%"
            />
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/80 px-2 text-gray-400 font-medium">Or sign in with phone</span>
            </div>
          </div>

          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  required
                  pattern="(\+?91|0)?[6-9][0-9]{9}"
                  title="Enter a 10-digit mobile number"
                  autoComplete="username"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="focus:ring-2 focus:ring-milquu-gold focus:border-transparent block w-full pl-10 sm:text-sm border-gray-200 rounded-xl py-3 bg-white/50 backdrop-blur-sm transition-all duration-300 outline-none"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-2 focus:ring-milquu-gold focus:border-transparent block w-full pl-10 sm:text-sm border-gray-200 rounded-xl py-3 bg-white/50 backdrop-blur-sm transition-all duration-300 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-milquu-blue/20 text-sm font-bold text-white bg-milquu-blue hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-milquu-blue disabled:opacity-70 disabled:transform-none"
              >
                {loading ? (
                  'Signing in...'
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-milquu-blue hover:text-blue-700 flex items-center justify-center mt-2 inline-flex">
                Create an account <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
