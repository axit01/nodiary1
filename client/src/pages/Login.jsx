import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Verification failed. Please check credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        if (!email) {
            setError('Please provide a registered email endpoint.');
            return;
        }
        setResetSent(true);
        setError('');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden font-jakarta">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 blur-[120px] rounded-full animate-pulse duration-[4000ms]"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-[460px] relative z-10"
            >
                <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden p-1">
                    <div className="bg-white rounded-[2.25rem] px-8 py-12 sm:px-12 sm:py-16">
                        {/* Brand Header */}
                        <div className="text-center mb-12">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-blue-500/20 rotate-3 transition-transform hover:rotate-0 duration-500">
                                <Lock className="text-white" size={28} strokeWidth={2.5} />
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                                Campus<span className="text-blue-600">Ops</span>
                            </h1>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">nexus access protocol</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-3"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                                {error}
                            </motion.div>
                        )}

                        {!isForgotPassword ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Endpoint</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-14 pr-6 py-4.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none text-slate-900 font-semibold transition-all placeholder:text-slate-400"
                                            placeholder="admin@campusops.io"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Protocol</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-14 pr-14 py-4.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none text-slate-900 font-semibold transition-all placeholder:text-slate-400"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-900 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl transition-all duration-300 shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50 text-xs uppercase tracking-[0.2em] mt-4 flex items-center justify-center gap-3 hover:bg-slate-800"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-[3px] border-slate-400 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>Initialize Session</>
                                    )}
                                </button>

                                <div className="pt-4 text-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsForgotPassword(true);
                                            setError('');
                                        }}
                                        className="text-[10px] text-slate-400 hover:text-blue-600 font-black uppercase tracking-widest transition-colors"
                                    >
                                        Recover Access Key
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-8">
                                {!resetSent ? (
                                    <>
                                        <div className="text-center">
                                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recovery Mode</h3>
                                            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Provide endpoint for verification</p>
                                        </div>

                                        <form onSubmit={handleForgotPassword} className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registered Email</label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                                    <input
                                                        type="email"
                                                        required
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="w-full pl-14 pr-6 py-4.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none text-slate-900 font-semibold transition-all placeholder:text-slate-400"
                                                        placeholder="admin@campusops.io"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl transition-all duration-300 shadow-xl shadow-slate-200 active:scale-[0.98] text-xs uppercase tracking-[0.2em] hover:bg-slate-800"
                                            >
                                                Transmit Reset Key
                                            </button>
                                        </form>
                                    </>
                                ) : (
                                    <div className="text-center py-6">
                                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                                            <Mail size={32} />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Transmission Sent</h3>
                                        <p className="text-[11px] text-slate-500 mt-3 font-bold leading-relaxed">
                                            Verification link dispatched to:<br />
                                            <span className="text-blue-600 mt-1 block font-black">{email}</span>
                                        </p>
                                    </div>
                                )}

                                <div className="text-center">
                                    <button
                                        onClick={() => {
                                            setIsForgotPassword(false);
                                            setResetSent(false);
                                            setError('');
                                        }}
                                        className="text-[10px] text-slate-400 hover:text-blue-600 font-black uppercase tracking-widest transition-colors"
                                    >
                                        Back to Entry Point
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                        © 2026 Campus Nexus <span className="mx-2 text-slate-200">|</span> Nexus Protocol v2.4
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
