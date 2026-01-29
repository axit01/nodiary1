import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.toString());
        }
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        // Simulate sending reset link
        if (!email) {
            setError('Please enter your email address');
            return;
        }
        setResetSent(true);
        setError('');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
                <div className="bg-slate-900 p-8 text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">CampusOps</h1>
                    <p className="text-slate-400 mt-2">Admin Panel Login</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    {!isForgotPassword ? (
                        <>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                            placeholder="admin@college.edu"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-lg shadow-blue-500/20"
                                >
                                    Sign In
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => {
                                        setIsForgotPassword(true);
                                        setError('');
                                    }}
                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Forgot your password?
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            {!resetSent ? (
                                <>
                                    <div className="text-center">
                                        <h3 className="text-lg font-semibold text-gray-800">Reset Password</h3>
                                        <p className="text-sm text-gray-500 mt-1">Enter your email to receive a reset link</p>
                                    </div>

                                    <form onSubmit={handleForgotPassword} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                                                <input
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                                    placeholder="admin@college.edu"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-lg shadow-blue-500/20"
                                        >
                                            Send Reset Link
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Mail size={32} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Check your email</h3>
                                    <p className="text-sm text-gray-500 mt-2">
                                        We have sent a password reset link to<br />
                                        <span className="font-medium text-gray-900">{email}</span>
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
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-500">© 2026 CampusOps. All rights reserved.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
