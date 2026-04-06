import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Milk, Lock, Mail, ArrowRight } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            if (user.role === 'delivery_staff') navigate('/delivery');
            else navigate('/admin');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await login(email, password);
            if (res.success) {
                toast.success('Welcome back! 👋');
                if (res.admin.role === 'delivery_staff') {
                    navigate('/delivery');
                } else {
                    navigate('/admin');
                }
            } else {
                toast.error(res.message || 'Login failed');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-brand-500/30">
            {/* Cinematic Background Elements */}
            <div className="absolute top-1/4 -left-[20%] w-[60%] h-[60%] bg-brand-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen animate-pulse-soft"></div>
            <div className="absolute bottom-1/4 -right-[20%] w-[60%] h-[60%] bg-accent-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
            
            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNHYtNGgtMnY0aC00djJoNHY0aDJ2LTRoNHYtMmgtNHptMC0zMFYwaC0ydjRoLTR2Mmg0djRoMnYtNGg0VjJoLTR6bS0xOCAwVjBoLTJ2NGgtNHYyaDR2NGgydi00aDRWMmgtNHptMCAzMHYtNGgtMnY0aC00djJoNHY0aDJ2LTRoNHYtMmgtNHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyIvPjwvZz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-slide-up">
                <div className="flex justify-center relative">
                    <div className="absolute inset-0 bg-brand-500 blur-2xl opacity-20 rounded-full scale-150"></div>
                    <div className="p-4 bg-dark-800 rounded-2xl border border-white/10 shadow-glow relative">
                       <Milk size={48} className="text-brand-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" strokeWidth={1.5} />
                    </div>
                </div>
                <h2 className="mt-8 text-center text-4xl font-extrabold text-white tracking-tight">
                    Milqu <span className="text-gradient">Portal</span>
                </h2>
                <p className="mt-2 text-center text-sm text-gray-400 font-medium tracking-wide">
                    SECURE STAFF VERIFICATION
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className="glass-panel py-10 px-6 sm:rounded-3xl sm:px-12 relative overflow-hidden">
                    {/* Glossy top highlight */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                            <div className="mt-1 relative rounded-xl shadow-sm group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-brand-400 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 bg-dark-900/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 transition-all sm:text-sm"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
                            <div className="mt-1 relative rounded-xl shadow-sm group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-brand-400 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 bg-dark-900/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 transition-all sm:text-sm tracking-widest"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-4 px-4 rounded-xl text-sm font-bold text-white bg-gradient-brand shadow-glow hover:shadow-glow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 focus:ring-brand-500 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all group overflow-hidden relative"
                            >
                                <span className="relative z-10 flex items-center">
                                    {loading ? 'Authenticating...' : 'Sign In'}
                                    {!loading && <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />}
                                </span>
                                {/* Button shine effect */}
                                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                            </button>
                        </div>
                        
                        <div className="text-center mt-6">
                            <a href="#" className="text-xs font-medium text-gray-500 hover:text-brand-400 transition-colors">
                                Forgot password? Contact administrator
                            </a>
                        </div>
                    </form>
                </div>
            </div>
            
            {/* Custom keyframes for this page */}
            <style jsx>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
