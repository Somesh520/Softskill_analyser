"use client";
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const confirmResolveRef = useRef(null);
  const toastIdRef = useRef(0);

  const showToast = useCallback((message, type = 'info') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      confirmResolveRef.current = resolve;
      setConfirmState({ message });
    });
  }, []);

  const handleConfirm = (result) => {
    confirmResolveRef.current?.(result);
    confirmResolveRef.current = null;
    setConfirmState(null);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} className="shrink-0" />;
      case 'error': return <AlertCircle size={18} className="shrink-0" />;
      case 'warning': return <AlertTriangle size={18} className="shrink-0" />;
      default: return <Info size={18} className="shrink-0" />;
    }
  };

  const getStyle = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500/10 border-green-500/30 text-green-500';
      case 'error': return 'bg-red-500/10 border-red-500/30 text-red-500';
      case 'warning': return 'bg-amber-500/10 border-amber-500/30 text-amber-600';
      default: return 'bg-primary/10 border-primary/30 text-primary';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* Toast Stack */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col-reverse items-center gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast, index) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border backdrop-blur-md max-w-sm ${getStyle(toast.type)}`}
            >
              {getIcon(toast.type)}
              <span className="text-sm font-semibold">{toast.message}</span>
              <button
                onClick={() => dismissToast(toast.id)}
                className="ml-1 p-1 rounded-md hover:bg-foreground/10 transition-colors cursor-pointer shrink-0"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {confirmState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => handleConfirm(false)}
          >
            <motion.div
              initial={{ y: 20, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 flex flex-col items-center text-center">
                <div className="bg-amber-500/10 p-3 rounded-full border border-amber-500/20 mb-4">
                  <AlertTriangle size={28} className="text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Are you sure?</h3>
                <p className="text-sm font-medium text-foreground/70 leading-relaxed">
                  {confirmState.message}
                </p>
              </div>
              <div className="flex gap-3 p-5 pt-0">
                <button
                  onClick={() => handleConfirm(false)}
                  className="flex-1 bg-background border border-border rounded-xl py-2.5 font-semibold text-sm hover:bg-foreground/5 transition-colors cursor-pointer text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirm(true)}
                  className="flex-1 bg-red-500 text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-red-600 transition-colors cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
