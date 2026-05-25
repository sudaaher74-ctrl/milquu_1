import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';
import { fetchAdminSetupStatus } from '../../services/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuthStore();
  const toast = useToastStore((s) => s.show);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hint, setHint] = useState('Sign in with your admin email and password.');
  const [allowRegister, setAllowRegister] = useState(false);

  useEffect(() => {
    if (isAuthenticated) { navigate('/admin', { replace: true }); return; }
    fetchAdminSetupStatus()
      .then((d) => {
        setAllowRegister(!!d?.allowSelfRegister);
        if (d?.allowSelfRegister) setHint('No admin exists yet. Create the first admin account below.');
      })
      .catch(() => setHint('Start the backend server first, then sign in.'));
  }, [isAuthenticated, navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Enter your email and password.'); return; }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      toast('Welcome to the Admin Dashboard ✅');
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!email || !password) { setError('Enter an email and password.'); return; }
    setLoading(true);
    try {
      await register(email.trim().toLowerCase(), password);
      toast('First admin account created! ✅');
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <img src="/images/new-logo.jpeg" alt="Milqu Fresh" className="w-10 h-10 rounded-xl object-contain" />
          <div>
            <div className="font-display font-bold text-lg text-gray-900">Milqu Fresh</div>
            <div className="text-xs text-gray-400">Admin Dashboard</div>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-5">{hint}</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
            <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@milquufresh.in" autoComplete="off" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
            <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="off" />
          </div>

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl transition-colors text-sm">
            {loading ? 'Signing in...' : 'Login to Dashboard'}
          </button>

          {allowRegister && (
            <button type="button" onClick={handleRegister} disabled={loading}
              className="w-full border-2 border-gray-200 hover:border-green-400 text-gray-700 font-semibold py-3 rounded-2xl transition-colors text-sm">
              Create First Admin
            </button>
          )}
        </form>
      </motion.div>
    </div>
  );
}
