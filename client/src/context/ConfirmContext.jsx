import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

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
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => handleClose(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20"
                        >
                            <div className="p-8 pb-6 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
                                    <AlertTriangle size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                    {config.title || 'Are you sure?'}
                                </h3>
                                <p className="text-slate-500 font-medium text-sm mt-2 leading-relaxed px-4">
                                    {config.message || 'This action cannot be undone and will permanently remove the data.'}
                                </p>
                            </div>

                            <div className="p-8 pt-0 flex gap-3">
                                <button
                                    onClick={() => handleClose(false)}
                                    className="flex-1 px-6 py-4 bg-slate-50 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleClose(true)}
                                    className={`flex-1 px-6 py-4 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg active:scale-95 ${config.variant === 'danger'
                                            ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'
                                            : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
                                        }`}
                                >
                                    {config.confirmText || 'Yes, Delete'}
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
