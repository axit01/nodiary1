import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleCheck, CircleAlert, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-10 right-10 z-[9999] flex flex-col gap-4 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, scale: 0.9, x: 100, rotate: 2 }}
                            animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: 20, transition: { duration: 0.2 } }}
                            className={`pointer-events-auto flex items-center gap-4 px-6 py-5 rounded-[1.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border-2 backdrop-blur-xl min-w-[320px] max-w-lg ${toast.type === 'error'
                                ? 'bg-white/90 border-rose-500/20 text-slate-900'
                                : toast.type === 'warning'
                                    ? 'bg-white/90 border-amber-500/20 text-slate-900'
                                    : 'bg-white/90 border-emerald-500/20 text-slate-900'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${toast.type === 'error' ? 'bg-rose-500/10 text-rose-600' :
                                toast.type === 'warning' ? 'bg-amber-500/10 text-amber-600' :
                                    'bg-emerald-500/10 text-emerald-600'
                                }`}>
                                {toast.type === 'error' ? <CircleAlert size={22} strokeWidth={2.5} /> :
                                    toast.type === 'warning' ? <Info size={22} strokeWidth={2.5} /> :
                                        <CircleCheck size={22} strokeWidth={2.5} />}
                            </div>

                            <div className="flex-1 min-w-0 pr-2">
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 ${toast.type === 'error' ? 'text-rose-500' :
                                    toast.type === 'warning' ? 'text-amber-500' :
                                        'text-emerald-500'
                                    }`}>
                                    {toast.type === 'error' ? 'System Fault' :
                                        toast.type === 'warning' ? 'Security Alert' :
                                            'Success'}
                                </p>
                                <p className="text-[13px] font-bold text-slate-600 truncate">{toast.message}</p>
                            </div>

                            <button
                                onClick={() => removeToast(toast.id)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-slate-900 active:scale-90"
                            >
                                <X size={16} strokeWidth={3} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
