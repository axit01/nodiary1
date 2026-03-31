import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TriangleAlert, X } from 'lucide-react';

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
    const [config, setConfig] = useState(null);

    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            setConfig({
                ...options,
                resolve
            });
        });
    }, []);

    const handleClose = (value) => {
        if (config?.resolve) {
            config.resolve(value);
        }
        setConfig(null);
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <AnimatePresence>
                {config && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => handleClose(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="relative bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] w-full max-w-[400px] overflow-hidden border border-white/20 p-2"
                        >
                            <div className="bg-slate-50/50 rounded-[2.5rem] p-8 pb-6 flex flex-col items-center text-center">
                                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl ${config.variant === 'danger'
                                    ? 'bg-rose-500/10 text-rose-500 shadow-rose-500/10'
                                    : 'bg-indigo-500/10 text-indigo-500 shadow-indigo-500/10'
                                    }`}>
                                    <TriangleAlert size={36} strokeWidth={2.5} />
                                </div>

                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Verification Required</p>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                                    {config.title || 'Are you sure?'}
                                </h3>
                                <p className="text-slate-500 font-bold text-sm mt-3 leading-relaxed px-2">
                                    {config.message || 'This action cannot be undone and will permanently remove the data.'}
                                </p>
                            </div>

                            <div className="p-6 flex gap-3">
                                <button
                                    onClick={() => handleClose(false)}
                                    className="flex-1 px-6 py-5 bg-white border-2 border-slate-100 text-slate-400 font-black text-[11px] uppercase tracking-widest rounded-[1.5rem] hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={() => handleClose(true)}
                                    className={`flex-1 px-6 py-5 text-white font-black text-[11px] uppercase tracking-widest rounded-[1.5rem] transition-all shadow-xl active:scale-95 ${config.variant === 'danger'
                                        ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
                                        : 'bg-[#0F172A] hover:bg-slate-800 shadow-slate-900/20'
                                        }`}
                                >
                                    {config.confirmText || 'Confirm'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => useContext(ConfirmContext);
